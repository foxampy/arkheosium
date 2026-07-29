// ─────────────────────────────────────────────────────────────────────────────
//  Макрорегионы: субрегионы ООН M49 с русскими названиями и цветами.
//
//  Почему именно M49, а не собственная нарезка мира. Во-первых, это готовая
//  общепринятая классификация: каждая страна отнесена ровно к одному
//  субрегиону, спорных случаев нет. Во-вторых, она уже проставлена в Natural
//  Earth в поле SUBREGION, то есть принадлежность приходит вместе с контуром,
//  а не сочиняется отдельным списком, который со временем разойдётся с данными.
//
//  Цвета сгруппированы по частям света: Азия — бирюзовая, Европа —
//  фиолетовая, Африка — янтарная, Америка — синяя, Океания — лаймовая.
//  Внутри семейства оттенки различимы, между семействами — тем более.
//  Центральная Азия несёт основной акцент проекта: это домашний регион.
// ─────────────────────────────────────────────────────────────────────────────

export interface MacroRegion {
  /** Значение поля SUBREGION в Natural Earth — оно же ключ группы. */
  id: string;
  name_ru: string;
  color: string;
}

const LIST: MacroRegion[] = [
  // Азия
  { id: 'Central Asia', name_ru: 'Центральная Азия', color: '#00e6c8' },
  { id: 'Eastern Asia', name_ru: 'Восточная Азия', color: '#06b6d4' },
  { id: 'Southern Asia', name_ru: 'Южная Азия', color: '#14b8a6' },
  { id: 'South-Eastern Asia', name_ru: 'Юго-Восточная Азия', color: '#2dd4bf' },
  { id: 'Western Asia', name_ru: 'Западная Азия', color: '#67e8f9' },
  // Европа
  { id: 'Eastern Europe', name_ru: 'Восточная Европа', color: '#a78bfa' },
  { id: 'Northern Europe', name_ru: 'Северная Европа', color: '#c084fc' },
  { id: 'Southern Europe', name_ru: 'Южная Европа', color: '#8b5cf6' },
  { id: 'Western Europe', name_ru: 'Западная Европа', color: '#d8b4fe' },
  // Африка
  { id: 'Northern Africa', name_ru: 'Северная Африка', color: '#fbbf24' },
  { id: 'Eastern Africa', name_ru: 'Восточная Африка', color: '#f59e0b' },
  { id: 'Middle Africa', name_ru: 'Центральная Африка', color: '#fb923c' },
  { id: 'Southern Africa', name_ru: 'Южная Африка', color: '#f97316' },
  { id: 'Western Africa', name_ru: 'Западная Африка', color: '#fcd34d' },
  // Америка
  { id: 'Northern America', name_ru: 'Северная Америка', color: '#60a5fa' },
  { id: 'Central America', name_ru: 'Центральная Америка', color: '#818cf8' },
  { id: 'Caribbean', name_ru: 'Карибский бассейн', color: '#93c5fd' },
  { id: 'South America', name_ru: 'Южная Америка', color: '#3b82f6' },
  // Океания
  { id: 'Australia and New Zealand', name_ru: 'Австралия и Новая Зеландия', color: '#a3e635' },
  { id: 'Melanesia', name_ru: 'Меланезия', color: '#bef264' },
];

export const MACRO_REGIONS: ReadonlyArray<MacroRegion> = LIST;

const MAP = new Map(LIST.map((r) => [r.id, r]));

/**
 * Макрорегион по значению SUBREGION. Если Natural Earth когда-нибудь принесёт
 * субрегион, которого нет в списке, мы отдаём заглушку с исходным названием —
 * страна попадёт в группу под английским именем и серым цветом. Это заметно
 * глазом при первом же открытии, но ничего не ломает.
 */
export function macroRegion(subregion: string): MacroRegion {
  return MAP.get(subregion) ?? { id: subregion, name_ru: subregion, color: '#94a3b8' };
}
