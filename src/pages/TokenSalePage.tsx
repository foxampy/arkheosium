/**
 * TokenSalePage — страница по адресу /token-sale.
 *
 * Здесь раньше стояла форма продажи VOD Token: цена 0,20 USD за токен,
 * объёмные бонусы +5/+10/+15 %, обратный отсчёт на 90 дней, четыре
 * кошелька для приёма USDT, ETH, BTC и TRX и утверждение, что за одним
 * токеном стоит 4600 м³ воды.
 *
 * Ни одно из этих чисел не имело основания. Цена не была утверждена,
 * срок отсчёта не был ничем задан, обеспечение водой не подтверждено
 * ни одним документом корпуса, а все четыре адреса кошельков были
 * буквальными заглушками вида PLACEHOLDER_USDT_WALLET — то есть форма
 * предлагала перевести деньги в никуда.
 *
 * Страница заменена на изложение того, что есть на самом деле. Маршрут
 * сохранён намеренно: по нему могли остаться внешние ссылки, и человек,
 * пришедший за покупкой токена, должен увидеть прямой отказ, а не 404
 * и не форму. Удалить страницу значило бы спрятать факт, что предложение
 * публиковалось.
 *
 * Восстанавливать продажу можно только вместе с утверждённой ценой,
 * юридической формой выпуска и реальными реквизитами. До тех пор форма
 * приёма средств здесь не появится.
 */

import { Link } from 'wouter';
import { ShieldAlert, ArrowRight, Fingerprint, Store, Handshake } from 'lucide-react';

const ACCENT = '#f87171';

/** Что именно было заявлено и почему снято. Таблица, а не формулировка. */
const WITHDRAWN: Array<{ claim: string; why: string }> = [
  {
    claim: 'Цена 0,20 USD за токен',
    why: 'Ставка не утверждена. Число стояло в коде константой без документа-основания.',
  },
  {
    claim: 'Бонус +5 %, +10 %, +15 % за объём покупки',
    why: 'Шкала не утверждена. Объёмный бонус подталкивает вносить больше и при неутверждённой цене является давлением, а не условием.',
  },
  {
    claim: 'Обратный отсчёт: 90 дней до конца раунда',
    why: 'Срок ничем не задавался. Таймер отсчитывал 90 дней от момента открытия страницы каждым посетителем — то есть создавал срочность, которой не существует.',
  },
  {
    claim: '1 токен = 4600 м³ воды',
    why: 'Обеспечение не подтверждено ни одним документом корпуса. Утверждение о материальном покрытии токена требует правового основания, которого нет.',
  },
  {
    claim: 'Приём USDT, ETH, BTC, TRX',
    why: 'Все четыре адреса были заглушками (PLACEHOLDER_..._WALLET). Форма предлагала перевести деньги в никуда.',
  },
  {
    claim: 'Эмиссия 100 000 000 токенов',
    why: 'Юридическая форма выпуска не определена, эмитент не зарегистрирован, эмиссия не проводилась.',
  },
];

export default function TokenSalePage() {
  return (
    <div className="min-h-screen text-slate-200">
      <div
        className="border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(248,113,113,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} style={{ color: ACCENT }} />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: ACCENT }}
            >
              Предложение снято
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-2xl">
            Токенсейл не проводится. Средства не принимаются.
          </h1>

          <p className="text-[14px] sm:text-base text-slate-400 mt-5 max-w-2xl leading-relaxed">
            На этой странице публиковалась форма продажи VOD Token. Предложение снято целиком:
            цена не была утверждена, срок раунда не был ничем задан, обеспечение водой не
            подтверждено документом, а адреса кошельков были заглушками. Если вы пришли сюда
            по ссылке с обещанием купить токен — покупать нечего, и это не временная пауза,
            а отсутствие предмета продажи.
          </p>

          <p className="text-[13px] text-slate-500 mt-4 max-w-2xl leading-relaxed">
            Мы не удалили страницу и не подменили её редиректом: предложение публиковалось,
            и честнее сказать об этом прямо, чем сделать вид, что его не было.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-[15px] font-semibold text-white mb-1">
          Что было заявлено и почему снято
        </h2>
        <p className="text-[13px] text-slate-500 mb-5 max-w-2xl leading-relaxed">
          Перечислено полностью, включая то, что выглядело безобидно. Заявление без
          основания — это заявление без основания, независимо от того, насколько скромно
          оно звучит.
        </p>

        <div className="grid gap-2.5">
          {WITHDRAWN.map((row) => (
            <div
              key={row.claim}
              className="rounded-xl border p-4"
              style={{ borderColor: 'rgba(148,163,184,0.16)', background: 'rgba(148,163,184,0.03)' }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                  style={{ color: ACCENT, background: `${ACCENT}18` }}
                >
                  снято
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-slate-200 leading-snug">
                    {row.claim}
                  </div>
                  <div className="text-[12.5px] text-slate-500 mt-1 leading-relaxed">{row.why}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border p-5 mt-8"
          style={{ borderColor: `${ACCENT}33`, background: `${ACCENT}0a` }}
        >
          <div className="text-[13.5px] font-semibold text-white mb-1.5">
            Если вы уже переводили средства по адресам с этой страницы
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            Адреса были заглушками и не принадлежали ни платформе, ни кому-либо ещё —
            строки вида <code className="text-slate-300">PLACEHOLDER_USDT_WALLET</code> не
            являются кошельками, и перевод по ним технически невозможен. Если вы переводили
            средства по адресу, который получили в переписке якобы от нашего имени, — это
            была не платформа. Напишите нам через раздел контактов.
          </p>
        </div>

        <h2 className="text-[15px] font-semibold text-white mt-10 mb-1">
          Что на платформе существует на самом деле
        </h2>
        <p className="text-[13px] text-slate-500 mb-4 max-w-2xl leading-relaxed">
          Работа ведётся, и она описана без обещаний доходности.
        </p>

        <div className="grid gap-2.5">
          {[
            {
              icon: Fingerprint,
              title: 'Запечатывание измерений',
              body:
                'Измерение с прибором, моментом, точкой и неопределённостью запечатывается в хэш-ноду. Токен там несёт ноду и не является финансовым инструментом; эмитировано ноль, приём средств не производится.',
              path: '/tokenization',
            },
            {
              icon: Store,
              title: 'Витрина услуг и продуктов',
              body:
                'Позиции с явной стадией готовности и условиями. Ни одна ставка не опубликована как утверждённая: условия рассчитываются под задачу.',
              path: '/showcase',
            },
            {
              icon: Handshake,
              title: 'Партнёрские входы',
              body:
                'Восемь сегментов, у каждого свой онбординг, срез whitepaper и список того, чего в предложении нет. Подключённых партнёров — ноль, и это написано числом.',
              path: '/partners',
            },
          ].map((c) => (
            <Link
              key={c.path}
              href={c.path}
              className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: 'rgba(148,163,184,0.16)' }}
            >
              <c.icon size={16} className="shrink-0 mt-0.5 text-slate-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-slate-200">{c.title}</span>
                <span className="block text-[12.5px] text-slate-500 mt-1 leading-relaxed">
                  {c.body}
                </span>
              </span>
              <ArrowRight size={14} className="shrink-0 mt-1 text-slate-600" />
            </Link>
          ))}
        </div>

        <div className="border-t mt-10 pt-6" style={{ borderColor: 'rgba(148,163,184,0.12)' }}>
          <p className="text-[12px] text-slate-500 leading-relaxed max-w-3xl">
            Страница носит описательный характер и не является офертой, инвестиционной
            рекомендацией или предложением приобрести какой-либо инструмент. Платформа не
            принимает средства, не выпускала токен и не обещает доходности. Продажа может
            появиться здесь только вместе с утверждённой ценой, юридической формой выпуска
            и проверяемыми реквизитами — до этого на странице не будет формы оплаты.
          </p>
        </div>
      </div>
    </div>
  );
}
