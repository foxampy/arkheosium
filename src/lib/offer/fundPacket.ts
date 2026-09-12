/**
 * Сборка пакета для фонда: что именно предлагается профинансировать.
 *
 * От конструктора предложения (draft.ts) отличается адресатом и поэтому
 * содержимым. Партнёру нужна область работ и границы передачи. Фонду
 * нужно другое: какая работа, на каком узле, чем подтвердится закрытие,
 * что он получит и чего не получит — и сколько это стоит.
 *
 * На последний вопрос ответа нет, и пакет отвечает «смета не
 * составлена» столько раз, сколько работ выбрано. Повторение здесь
 * намеренное: одна оговорка в шапке читается как формальность, строка
 * у каждой позиции — как состояние дел.
 *
 * Логика вынесена из компонента по той же причине, что и draft: пакет,
 * который существует только внутри страницы, нельзя ни проверить, ни
 * унести в письмо.
 */

import { WORK_PACKAGES, NOT_OFFERED, type WorkPackage } from '@/data/platform/fund';
import { NODE_STATUS_LABEL } from '@/data/platform/nodes';
import { ROLES } from '@/data/platform/roles';
import { WORK_ORDER } from '@/data/platform/contract';

export interface FundPacket {
  items: WorkPackage[];
  /** Предупреждения: чего в этом пакете сегодня быть не может. */
  warnings: string[];
}

export function buildPacket(nodeIds: readonly string[]): FundPacket {
  const items = WORK_PACKAGES.filter((w) => nodeIds.includes(w.nodeId));
  const warnings: string[] = [];

  if (items.length === 0) {
    warnings.push(
      'Работы не выбраны. Разговор с фондом начинается с одной названной работы на одном ' +
        'названном объекте, а не с общего знакомства с платформой.',
    );
  }

  const notStarted = items.filter((w) => w.node.status === 'not-started');
  if (notStarted.length > 0) {
    warnings.push(
      `Не начаты: ${notStarted.map((w) => w.node.title).join('; ')}. Кода в репозитории нет — ` +
        'эти позиции входят в пакет как исследование с нуля, у которого может быть ' +
        'отрицательный результат.',
    );
  }

  const empty = items.filter((w) => w.node.status === 'empty');
  if (empty.length > 0) {
    warnings.push(
      `Каркас без записей: ${empty.map((w) => w.node.title).join('; ')}. Здесь нужна не ` +
        'разработка, а наполнение, и оно не требует финансирования — справедливо спросить, ' +
        'почему не сделано.',
    );
  }

  warnings.push(
    'Сметы нет ни по одной позиции. Она считается после обследования объекта, ' +
      'а не до него: смета без обследования — это цифра, подобранная под ожидание.',
  );
  warnings.push(
    'Оценки компании, условий раунда и таблицы капитализации не существует. ' +
      'Привлечено средств ноль, реквизитов платформа не публикует.',
  );
  warnings.push(
    'Источник возврата называется в договоре по конкретной работе. Общего механизма ' +
      'возврата платформа не предлагает.',
  );

  return { items, warnings };
}

/** Пакет обычным текстом — чтобы унести в письмо. */
export function packetToText(p: FundPacket): string {
  const investor = ROLES.find((r) => r.id === 'investor');
  const L: string[] = [];

  L.push('ПАКЕТ ДЛЯ ФОНДА — не оферта, не предложение инвестиции, не согласованные условия.');
  L.push('');
  L.push(`Выбрано работ: ${p.items.length}`);
  L.push('');

  L.push('ЧТО ПРЕДЛАГАЕТСЯ ПРОФИНАНСИРОВАТЬ');
  if (p.items.length === 0) {
    L.push('  · ⟨работы не выбраны⟩');
  } else {
    p.items.forEach((w, i) => {
      L.push(`  ${i + 1}. ${w.node.title} — ${NODE_STATUS_LABEL[w.node.status]}`);
      L.push(`     Состояние: ${w.node.have}`);
      L.push(`     Чего нет: ${w.node.missing}`);
      L.push(`     Работа: ${w.work}`);
      L.push(`     Закрывается: ${w.closedBy}`);
      L.push(`     Смета: ${w.estimate}`);
      L.push('');
    });
  }

  L.push('ПОРЯДОК РАБОТ (не сокращается)');
  L.push('  ' + WORK_ORDER.join(' → '));
  L.push('');

  if (investor) {
    L.push('ЧТО ФОНД ПОЛУЧАЕТ');
    L.push(`  · ${investor.gets}`);
    L.push('');
  }

  L.push('ЧЕГО ФОНД НЕ ПОЛУЧАЕТ');
  NOT_OFFERED.forEach((t) => L.push(`  · ${t}`));
  L.push('');

  L.push('ЧЕГО В ЭТОМ ПАКЕТЕ СЕГОДНЯ БЫТЬ НЕ МОЖЕТ');
  p.warnings.forEach((t) => L.push(`  · ${t}`));
  L.push('');

  L.push(
    'Собрано из состояния узлов репозитория ArkheOSium. Объёмы и числа записей проверяются ' +
      'обходом исходников по указанным каталогам.',
  );
  return L.join('\n');
}
