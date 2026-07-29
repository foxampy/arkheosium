// ─────────────────────────────────────────────────────────────────────────────
//  Реестр внешних источников данных ARKHEOSIUM.
//
//  Правило файла: «источник работает» — это не мнение и не строчка из каталога
//  public-apis, а результат реального запроса. Поэтому статус `verified`
//  невозможно поставить без объекта `probe`: URL, дата, HTTP-код и заголовок
//  CORS, полученные из ответа. `assertDataApi` роняет сборку, если статус
//  заявлен, а доказательства нет.
//
//  Каталоги врут. При проверке 2026-07-29 public-apis утверждал, что у
//  World Bank API нет CORS — на деле сервер отдаёт `Access-Control-Allow-Origin: *`.
//  Поэтому источником истины здесь является ответ сервера, а не README.
// ─────────────────────────────────────────────────────────────────────────────

/** Предметная область, которую источник закрывает. */
export type DataDomain =
  | 'weather'    // погода и прогноз
  | 'climate'    // климатические ряды и сценарии
  | 'hydrology'  // сток, расход рек, водный баланс
  | 'satellite'  // снимки и растровые слои
  | 'terrain'    // рельеф, высоты, батиметрия
  | 'soil'       // почвы
  | 'biodiversity'
  | 'geospatial' // объекты на местности, геокодирование
  | 'economy'    // макроэкономика, торговля
  | 'science'    // публикации, проекты, DOI
  | 'funding'    // гранты и конкурсы
  | 'hazard';    // стихийные события

export const DOMAIN_LABELS: Record<DataDomain, string> = {
  weather: 'Погода',
  climate: 'Климат',
  hydrology: 'Гидрология',
  satellite: 'Спутник',
  terrain: 'Рельеф',
  soil: 'Почвы',
  biodiversity: 'Биоразнообразие',
  geospatial: 'Геоданные',
  economy: 'Экономика',
  science: 'Наука',
  funding: 'Финансирование',
  hazard: 'Стихийные события',
};

export const DOMAIN_COLORS: Record<DataDomain, string> = {
  weather: '#7dd3fc',
  climate: '#00d4ff',
  hydrology: '#00e6c8',
  satellite: '#a78bfa',
  terrain: '#f59e0b',
  soil: '#d97706',
  biodiversity: '#34d399',
  geospatial: '#a3e635',
  economy: '#c084fc',
  science: '#8b7cff',
  funding: '#fbbf24',
  hazard: '#f87171',
};

/** Что требуется, чтобы получить ответ. */
export type AuthMode =
  | 'none'          // ключ не нужен вообще
  | 'user-agent'    // нужен осмысленный User-Agent (политика вежливого использования)
  | 'key-free'      // ключ нужен, но выдаётся бесплатно
  | 'key-paid';     // ключ платный

export const AUTH_LABELS: Record<AuthMode, string> = {
  none: 'Без ключа',
  'user-agent': 'Нужен User-Agent',
  'key-free': 'Бесплатный ключ',
  'key-paid': 'Платный ключ',
};

/**
 * Готовность источника к использованию.
 *
 * `verified`     — проверен запросом, вызывается прямо из браузера.
 * `needs-proxy`  — отвечает, но без CORS: нужен серверный посредник.
 * `needs-key`    — требует регистрации, ключ ещё не получен.
 * `unavailable`  — на момент проверки не отвечал или закрыт.
 */
export type ApiStatus = 'verified' | 'needs-proxy' | 'needs-key' | 'unavailable';

export const API_STATUS_LABELS: Record<ApiStatus, string> = {
  verified: 'Проверен живым запросом',
  'needs-proxy': 'Нужен серверный прокси (нет CORS)',
  'needs-key': 'Нужен ключ доступа',
  unavailable: 'Недоступен на момент проверки',
};

export const API_STATUS_COLORS: Record<ApiStatus, string> = {
  verified: '#34d399',
  'needs-proxy': '#f59e0b',
  'needs-key': '#00d4ff',
  unavailable: '#f87171',
};

/**
 * Доказательство работоспособности — то, что вернул сервер.
 * Заполняется только по факту выполненного запроса. Придумывать эти поля
 * бессмысленно: любой может повторить запрос по `url` и сверить.
 */
export interface ApiProbe {
  /** Точный URL, по которому выполнялась проверка. Воспроизводимо. */
  url: string;
  /** Метод, если не GET. */
  method?: 'GET' | 'POST';
  /** Дата проверки, ISO. */
  checkedAt: string;
  httpStatus: number;
  /** Значение заголовка Access-Control-Allow-Origin или null, если его нет. */
  corsAllowOrigin: string | null;
  /** Размер тела ответа в байтах — подтверждает, что ответ непустой. */
  bytes: number;
  /** Что именно пришло. Одна фраза, проверяемая повторным запросом. */
  returned: string;
}

export interface DataApi {
  id: string;
  name: string;
  provider: string;
  /** Официальная документация. Обязательно https. */
  docsUrl: string;
  /** Базовый адрес. Обязательно https. */
  baseUrl: string;
  domains: DataDomain[];
  auth: AuthMode;
  status: ApiStatus;
  probe: ApiProbe | null;
  /** Что источник даёт системе. Конкретно, без «данные». */
  provides: string;
  /** Ограничения: частота, объём, некоммерческое использование. null — не заявлены. */
  limits: string | null;
  /** Условия использования и атрибуция. null — не найдены. */
  license: string | null;
  /** id программ экосистемы, которым источник нужен. */
  servesPrograms: string[];
  /** id вех, которые этот источник закрывает. */
  unlocksMilestones: string[];
  /** Честное ограничение применимости. Например «данные только по США». */
  caveat?: string;
}

// ── Валидация ────────────────────────────────────────────────────────────────

export function assertDataApi(a: DataApi): DataApi {
  const fail = (msg: string): never => {
    throw new Error(`[apis] ${a.id ?? '<no id>'}: ${msg}`);
  };

  if (!a.id || !/^[a-z0-9][a-z0-9-]*$/.test(a.id)) fail('id должен быть kebab-case');
  if (!a.name?.trim()) fail('пустое name');
  if (!a.provider?.trim()) fail('пустой provider');
  if (!a.provides?.trim()) fail('пустое provides — непонятно, зачем источник нужен');
  if (!/^https:\/\//.test(a.docsUrl)) fail('docsUrl должен быть https');
  if (!/^https:\/\//.test(a.baseUrl)) fail('baseUrl должен быть https');
  if (!a.domains.length) fail('нужна хотя бы одна предметная область');

  // Главное правило: заявленная работоспособность требует доказательства.
  if (a.status === 'verified') {
    if (!a.probe) fail('статус "verified" без объекта probe — недоказуемое утверждение');
    if (a.probe.httpStatus < 200 || a.probe.httpStatus >= 300) {
      fail(`статус "verified" при HTTP ${a.probe.httpStatus}`);
    }
    if (!a.probe.corsAllowOrigin) {
      fail('статус "verified" без CORS: из браузера источник не вызвать, это "needs-proxy"');
    }
    if (a.probe.bytes <= 0) fail('статус "verified" при пустом теле ответа');
  }

  if (a.status === 'needs-proxy' && a.probe?.corsAllowOrigin) {
    fail('статус "needs-proxy", но CORS в ответе присутствует — источник вызывается напрямую');
  }

  if (a.probe) {
    if (!/^https?:\/\//.test(a.probe.url)) fail('probe.url должен быть абсолютным');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.probe.checkedAt)) fail('probe.checkedAt должен быть YYYY-MM-DD');
    if (!a.probe.returned?.trim()) fail('probe.returned пуст — неясно, что вернул сервер');
  }

  return a;
}

/** Источник можно дёргать прямо из браузера, без своего бэкенда. */
export function isBrowserCallable(a: DataApi): boolean {
  return a.status === 'verified' && !!a.probe?.corsAllowOrigin;
}
