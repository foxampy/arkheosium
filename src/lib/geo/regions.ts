// Реестр стран и областей Центральной Азии для группировки меток на карте.
//
// Координата области — её административный центр, а не центроид полигона.
// Для якоря кластера этого достаточно, и величина устойчивая: центр области
// не меняется при фильтрации набора объектов.

export interface GeoPlace {
  /** Каноническое название, совпадает с полем region/country у объектов */
  name: string;
  nameEn: string;
  /** Альтернативные написания для сопоставления */
  aliases: string[];
  lat: number;
  lng: number;
  /** Страна, к которой относится область; для стран — undefined */
  country?: string;
}

export const COUNTRIES: GeoPlace[] = [
  { name: 'Узбекистан', nameEn: 'Uzbekistan', aliases: ['Uzbekistan', 'UZ', "O'zbekiston"], lat: 41.38, lng: 64.59 },
  { name: 'Казахстан', nameEn: 'Kazakhstan', aliases: ['Kazakhstan', 'KZ'], lat: 48.02, lng: 66.92 },
  { name: 'Туркменистан', nameEn: 'Turkmenistan', aliases: ['Turkmenistan', 'TM'], lat: 38.97, lng: 59.56 },
  { name: 'Таджикистан', nameEn: 'Tajikistan', aliases: ['Tajikistan', 'TJ'], lat: 38.86, lng: 71.28 },
  { name: 'Киргизия', nameEn: 'Kyrgyzstan', aliases: ['Kyrgyzstan', 'Кыргызстан', 'KG'], lat: 41.20, lng: 74.77 },
  { name: 'Афганистан', nameEn: 'Afghanistan', aliases: ['Afghanistan', 'AF'], lat: 33.94, lng: 67.71 },
];

/** Административные единицы первого уровня Узбекистана. */
export const UZ_REGIONS: GeoPlace[] = [
  { name: 'Республика Каракалпакстан', nameEn: 'Karakalpakstan', aliases: ['Каракалпакстан', 'Karakalpakstan', "Qoraqalpog'iston"], lat: 42.46, lng: 59.61, country: 'Узбекистан' },
  { name: 'Хорезмская область', nameEn: 'Khorezm Region', aliases: ['Хорезм', 'Khorezm', 'Xorazm'], lat: 41.55, lng: 60.63, country: 'Узбекистан' },
  { name: 'Навоийская область', nameEn: 'Navoiy Region', aliases: ['Навои', 'Navoiy', 'Navoi'], lat: 40.10, lng: 65.37, country: 'Узбекистан' },
  { name: 'Бухарская область', nameEn: 'Bukhara Region', aliases: ['Бухара', 'Bukhara', 'Buxoro'], lat: 39.77, lng: 64.42, country: 'Узбекистан' },
  { name: 'Кашкадарьинская область', nameEn: 'Qashqadaryo Region', aliases: ['Кашкадарья', 'Qashqadaryo', 'Kashkadarya'], lat: 38.86, lng: 65.79, country: 'Узбекистан' },
  { name: 'Сурхандарьинская область', nameEn: 'Surxondaryo Region', aliases: ['Сурхандарья', 'Surxondaryo', 'Surkhandarya'], lat: 37.22, lng: 67.28, country: 'Узбекистан' },
  { name: 'Самаркандская область', nameEn: 'Samarkand Region', aliases: ['Самарканд', 'Samarkand', 'Samarqand'], lat: 39.65, lng: 66.96, country: 'Узбекистан' },
  { name: 'Джиззакская область', nameEn: 'Jizzakh Region', aliases: ['Джиззак', 'Jizzakh', 'Jizzax'], lat: 40.12, lng: 67.84, country: 'Узбекистан' },
  { name: 'Сырдарьинская область', nameEn: 'Sirdaryo Region', aliases: ['Сырдарья', 'Sirdaryo', 'Syrdarya', 'Гулистан'], lat: 40.49, lng: 68.78, country: 'Узбекистан' },
  { name: 'Ташкентская область', nameEn: 'Tashkent Region', aliases: ['Ташкентская', 'Tashkent Region', 'Toshkent viloyati'], lat: 41.00, lng: 69.60, country: 'Узбекистан' },
  { name: 'Город Ташкент', nameEn: 'Tashkent City', aliases: ['Ташкент', 'Tashkent', 'Toshkent'], lat: 41.31, lng: 69.24, country: 'Узбекистан' },
  { name: 'Наманганская область', nameEn: 'Namangan Region', aliases: ['Наманган', 'Namangan'], lat: 40.99, lng: 71.67, country: 'Узбекистан' },
  { name: 'Андижанская область', nameEn: 'Andijan Region', aliases: ['Андижан', 'Andijan', 'Andijon'], lat: 40.78, lng: 72.34, country: 'Узбекистан' },
  { name: 'Ферганская область', nameEn: 'Fergana Region', aliases: ['Фергана', 'Fergana', "Farg'ona"], lat: 40.39, lng: 71.79, country: 'Узбекистан' },
];

export const GEO_PLACES: GeoPlace[] = [...COUNTRIES, ...UZ_REGIONS];

function normalizeName(s: string): string {
  return s.trim().toLowerCase().replace(/[ё]/g, 'е').replace(/\s+/g, ' ');
}

const PLACE_INDEX: Map<string, GeoPlace> = (() => {
  const index = new Map<string, GeoPlace>();
  for (const place of GEO_PLACES) {
    for (const key of [place.name, place.nameEn, ...place.aliases]) {
      index.set(normalizeName(key), place);
    }
  }
  return index;
})();

/** Ищет место по любому из его написаний. */
export function findPlace(name?: string | null): GeoPlace | undefined {
  if (!name) return undefined;
  return PLACE_INDEX.get(normalizeName(name));
}

/** Координата якоря для названия страны или области. */
export function regionCentroid(name?: string | null): { lat: number; lng: number } | undefined {
  const place = findPlace(name);
  return place ? { lat: place.lat, lng: place.lng } : undefined;
}
