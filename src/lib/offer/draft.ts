/**
 * Конструктор предложения: проектного, франшизного, экосистемного.
 *
 * Обычный конструктор коммерческого предложения устроен как калькулятор:
 * выбрал позиции — получил сумму. Здесь сумму выдать не из чего, и это
 * не недоработка, а состояние дел: развёртываний ноль, узлов, прошедших
 * стандартизацию, ноль, утверждённых ставок ноль. Калькулятор, который
 * в таком положении показывает число, показывает выдуманное число.
 *
 * Поэтому конструктор собирает не цену, а область работ и её границы:
 * что передаётся, что не передаётся, что не отключается ни при какой
 * конфигурации, в каком порядке идут работы и — главное — чего в этом
 * предложении сегодня быть не может.
 *
 * Понижение уровня. Партнёр может запросить франшизу; если ни один из
 * выбранных узлов не прошёл стандартизацию, конструктор не отказывает
 * и не соглашается — он понижает уровень до «Исследование» и называет
 * причину. Это единственное место, где логика принимает решение за
 * человека, и она принимает его в сторону меньшего обещания.
 *
 * Функция чистая и не знает про React: её можно вызвать из теста,
 * из скрипта и из другой сборки. Предложение, которое существует
 * только внутри компонента страницы, нельзя ни проверить, ни
 * переиспользовать.
 */

import { NODES, STANDARDIZED_COUNT, nodeById, type PlatformNode } from '@/data/platform/nodes';
import { LADDER, MINIMUM, TRANSFER, WORK_ORDER, type LadderStep } from '@/data/platform/contract';

/** Что собирается. */
export type OfferKind = 'project' | 'franchise' | 'ecosystem';

/** Зачем собирается: делаем вместе или передаём в эксплуатацию. */
export type OfferPurpose = 'develop' | 'operate';

export const KIND_LABEL: Record<OfferKind, string> = {
  project: 'Проект на объекте',
  franchise: 'Франшиза',
  ecosystem: 'Экосистема — новая сборка',
};

export const KIND_HINT: Record<OfferKind, string> = {
  project: 'Одна задача на названном объекте: обследование, решение, внедрение.',
  franchise: 'Право эксплуатации конфигурации на названном рынке и в названном сроке.',
  ecosystem: 'Своя предметная область на тех же узлах — как TerrOSium или Ethosium.',
};

export const PURPOSE_LABEL: Record<OfferPurpose, string> = {
  develop: 'Разработать вместе',
  operate: 'Получить в эксплуатацию',
};

export const PURPOSE_HINT: Record<OfferPurpose, string> = {
  develop: 'Работа ведётся совместно, результат доводится до передаваемого состояния.',
  operate: 'Готовая конфигурация передаётся стороне с правом пользоваться ею.',
};

export interface OfferInput {
  kind: OfferKind;
  purpose: OfferPurpose;
  nodeIds: readonly string[];
  /** Рынок или территория. Пустая строка — не назван. */
  market: string;
  /** Срок. Пустая строка — не назван. */
  term: string;
}

/** Уровень лестницы, который соответствует запросу до проверки состояния. */
const REQUESTED: Record<OfferKind, Record<OfferPurpose, LadderStep['id']>> = {
  project: { develop: 'system', operate: 'deployment' },
  franchise: { develop: 'franchise', operate: 'franchise' },
  ecosystem: { develop: 'system', operate: 'franchise' },
};

function step(id: LadderStep['id']): LadderStep {
  const s = LADDER.find((x) => x.id === id);
  if (!s) throw new Error(`неизвестный уровень лестницы: «${id}»`);
  return s;
}

export interface OfferDraft {
  /** Предмет предложения одной фразой. */
  subject: string;
  /** Уровень, на который партнёр рассчитывал. */
  requested: LadderStep;
  /** Уровень, который возможен при сегодняшнем состоянии. */
  allowed: LadderStep;
  /** Отличаются ли они. Если да — причина стоит первой в warnings. */
  downgraded: boolean;
  nodes: PlatformNode[];
  transfers: string[];
  notTransfers: string[];
  minimum: readonly string[];
  workOrder: readonly string[];
  /** Ставка. Всегда пробел: утверждённых ставок ноль. */
  rate: string;
  /** Что в этом предложении сегодня быть не может и почему. */
  warnings: string[];
}

export function buildDraft(input: OfferInput): OfferDraft {
  const nodes = input.nodeIds
    .map(nodeById)
    .filter((n): n is PlatformNode => !!n);

  const requested = step(REQUESTED[input.kind][input.purpose]);

  const chosenStandardized = nodes.length > 0 && nodes.every((n) => n.standardized);
  const allowed =
    requested.needsStandardized && !chosenStandardized ? step('research') : requested;

  const warnings: string[] = [];

  if (allowed.id !== requested.id) {
    warnings.push(
      `Уровень понижен: «${requested.title}» → «${allowed.title}». Причина: передать можно ` +
        `только узел, прошедший стандартизацию, а таких сегодня ${STANDARDIZED_COUNT}. ` +
        'До стандартизации предметом соглашения является работа, а не узел.',
    );
  }

  if (nodes.length === 0) {
    warnings.push(
      'Узлы не выбраны. Предложение без поимённого перечня узлов означает передачу ' +
        'библиотеки целиком — так лицензия не составляется.',
    );
  }

  nodes
    .filter((n) => n.status === 'not-started')
    .forEach((n) =>
      warnings.push(
        `Узел «${n.title}» не начат: кода в репозитории нет. Он может войти в предложение ` +
          'только как исследовательская работа с нуля.',
      ),
    );

  if (input.kind !== 'project' && !input.market.trim()) {
    warnings.push(
      'Рынок или территория не названы. Право эксплуатации без границ рынка означает ' +
        'передачу везде — такое условие не подписывается.',
    );
  }

  if (!input.term.trim()) {
    warnings.push(
      'Срок не назван. Лицензия без срока означает бессрочную передачу, включая будущие ' +
        'версии, которые как раз не передаются.',
    );
  }

  if (input.purpose === 'operate') {
    warnings.push(
      'Право эксплуатации сегодня не передаётся ни одной стороне: выдано лицензий ноль, ' +
        'правовая форма не составлена, типового договора нет.',
    );
  }

  if (input.kind === 'franchise') {
    warnings.push(
      'Право сублицензирования не передаётся по умолчанию: иначе конфигурация расходится ' +
        'дальше без ведома и без учёта.',
    );
  }

  if (input.kind === 'ecosystem') {
    warnings.push(
      'Новая сборка вправе иметь собственную конституцию, но только поверх неотключаемого ' +
        'минимума. Отключить его «своей конституцией» нельзя — это и есть тот обход, ' +
        'ради которого минимум существует.',
    );
  }

  warnings.push(
    'Соблюдение неотключаемого минимума обеспечено единственным средством — правом отозвать ' +
      'имя и снять сборку с реестра. Технического принуждения нет, механизм проверки ' +
      'не построен.',
  );

  const marketText = input.market.trim() || '⟨рынок не назван⟩';
  const termText = input.term.trim() || '⟨срок не назван⟩';

  const subject =
    `${KIND_LABEL[input.kind]} · ${PURPOSE_LABEL[input.purpose]} · ` +
    `уровень «${allowed.title}» · ${marketText} · ${termText}`;

  const transfers = [
    ...(nodes.length
      ? [`Узлы библиотеки поимённо: ${nodes.map((n) => n.title).join('; ')}`]
      : []),
    ...TRANSFER.filter((r) => r.yes).map((r) => `${r.layer} — ${r.transferred}. ${r.meaning}`),
    `Границы: рынок ${marketText}, срок ${termText}`,
  ];

  const notTransfers = TRANSFER.filter((r) => !r.yes).map(
    (r) => `${r.layer} — ${r.transferred}. ${r.meaning}`,
  );

  return {
    subject,
    requested,
    allowed,
    downgraded: allowed.id !== requested.id,
    nodes,
    transfers,
    notTransfers,
    minimum: MINIMUM,
    workOrder: WORK_ORDER,
    rate: allowed.rate,
    warnings,
  };
}

/**
 * Черновик обычным текстом — чтобы его можно было унести в письмо или
 * в документ. Форма нарочно бедная: это заготовка для разговора, а не
 * коммерческое предложение и тем более не оферта.
 */
export function draftToText(d: OfferDraft): string {
  const L: string[] = [];
  L.push('ЧЕРНОВИК ПРЕДЛОЖЕНИЯ — не оферта, не обязательство, не согласованные условия.');
  L.push('');
  L.push(`Предмет: ${d.subject}`);
  L.push(`Уровень: ${d.allowed.title} — ${d.allowed.gets}`);
  if (d.downgraded) L.push(`Запрошенный уровень: ${d.requested.title} (понижен, см. ограничения)`);
  L.push(`Ставка: ${d.rate} — утверждённых ставок ноль, условия считаются под задачу.`);
  L.push('');
  L.push('ПЕРЕДАЁТСЯ');
  d.transfers.forEach((t) => L.push(`  · ${t}`));
  L.push('');
  L.push('НЕ ПЕРЕДАЁТСЯ');
  d.notTransfers.forEach((t) => L.push(`  · ${t}`));
  L.push('');
  L.push('НЕ ОТКЛЮЧАЕТСЯ НИ В КАКОЙ КОНФИГУРАЦИИ');
  d.minimum.forEach((t, i) => L.push(`  ${i + 1}. ${t}`));
  L.push('');
  L.push('ПОРЯДОК РАБОТ (не сокращается)');
  L.push('  ' + d.workOrder.join(' → '));
  L.push('');
  L.push('ЧЕГО В ЭТОМ ПРЕДЛОЖЕНИИ СЕГОДНЯ БЫТЬ НЕ МОЖЕТ');
  d.warnings.forEach((t) => L.push(`  · ${t}`));
  L.push('');
  L.push(
    'Собрано конструктором предложений ArkheOSium из условий передачи, записанных в главе 12 ' +
      'документа. Своих формулировок у конструктора нет.',
  );
  return L.join('\n');
}

/** Все узлы — для выбора в интерфейсе. Реэкспорт, чтобы страница не знала про два модуля. */
export { NODES };
