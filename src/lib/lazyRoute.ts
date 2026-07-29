// ─────────────────────────────────────────────────────────────────────────────
//  Загрузка страниц по требованию, устойчивая к сбою сети и к смене сборки.
//
//  Симптом, ради которого написан файл: страница открывается, показывает
//  «Что-то пошло не так», а после ручной перезагрузки работает. Это не ошибка
//  в самой странице. Это неудавшийся `import()` её чанка.
//
//  Две причины, обе реальные:
//  1. Новый деплой. Во вкладке остался старый index.html со ссылками на чанки
//     со старыми хешами. Их на сервере больше нет — 404. Перезагрузка помогает
//     потому, что подтягивает новый index.html. Пользователь не обязан об этом
//     догадываться.
//  2. Обрыв или таймаут сети на мобильном соединении. Одна повторная попытка
//     через долю секунды решает это без перезагрузки.
//
//  Порядок действий: попытка → пауза → повтор → однократная жёсткая
//  перезагрузка → и только потом ошибка наверх. Флаг в sessionStorage не даёт
//  зациклить перезагрузку: если после неё импорт снова упал, значит дело не в
//  устаревшей сборке, и ошибку нужно показать, а не прятать в бесконечный цикл.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, type ComponentType } from 'react';

/** Мы уже перезагружали страницу из-за неудачного импорта в этой сессии. */
const RELOAD_FLAG = 'arkheosium:chunk-reload';

/** Пауза перед повторной попыткой, мс. */
const RETRY_DELAY = 350;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Отличает «чанк не загрузился» от «внутри страницы упал код».
 * Во втором случае перезагрузка бессмысленна — ошибку надо показать.
 */
export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) || // Safari
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg)
  );
}

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(RELOAD_FLAG) === '1';
  } catch {
    // sessionStorage может быть недоступен в приватном режиме — тогда просто
    // не перезагружаемся, а показываем ошибку. Хуже не станет.
    return true;
  }
}

function writeFlag(): void {
  try {
    sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    /* игнорируем: отсутствие хранилища не должно ломать навигацию */
  }
}

function clearFlag(): void {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* игнорируем */
  }
}

/**
 * Замена `React.lazy` для маршрутов приложения.
 * Сигнатура совпадает, поэтому подменяется один в один.
 */
export function lazyRoute<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      // Успешная загрузка снимает флаг: следующий сбой снова получит право
      // на одну перезагрузку.
      clearFlag();
      return mod;
    } catch (first) {
      if (!isChunkLoadError(first)) throw first;

      await sleep(RETRY_DELAY);
      try {
        const mod = await factory();
        clearFlag();
        return mod;
      } catch (second) {
        if (!isChunkLoadError(second)) throw second;

        if (readFlag()) {
          // Перезагрузка уже была и не помогла. Показываем настоящую ошибку.
          throw second;
        }

        writeFlag();
        window.location.reload();
        // Страница выгружается. Промис намеренно никогда не разрешается,
        // чтобы React не успел отрисовать экран ошибки перед уходом.
        return new Promise<never>(() => {});
      }
    }
  });
}
