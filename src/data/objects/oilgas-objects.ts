// ═══════════════════════════════════════════════════════════════
//  Нефтегазовые объекты Центральной Азии
//
//  Правило корпуса: в записи попадает только то, что подтверждено
//  публичным источником. Поэтому у каждого объекта есть `sources`, а у
//  координаты — `coord_precision`, честно говорящая, насколько точно мы
//  знаем место:
//
//    exact             — координата самой площадки
//    field_centroid    — точка внутри контура месторождения
//    settlement_proxy  — координата ближайшего населённого пункта
//    region_proxy      — только административный центр области
//
//  Объекты, для которых не нашлось ни координаты, ни надёжного заменителя,
//  в файл не внесены. Поставить правдоподобную точку значило бы выдать
//  догадку за данные.
//
//  Где числа расходятся между источниками (запасы Газли: 470 / 500 / 700 /
//  714 млрд м³), в запись не берётся ни одно из них — расхождение указано
//  в описании. Выбрать одно значило бы придумать точность, которой нет.
// ═══════════════════════════════════════════════════════════════

import type { PlatformObject } from '../objects-data';

export type CoordPrecision =
  | 'exact'
  | 'field_centroid'
  | 'settlement_proxy'
  | 'region_proxy';

export const OILGAS_OBJECTS: PlatformObject[] = [
  {
    id: 'OG-UZ-GF-001',
    name: 'Shurtan Gas Field',
    name_ru: 'Месторождение Шуртан',
    type: 'gas_field',
    type_label: 'Газовое месторождение',
    domain: 'oilgas',
    region: 'Кашкадарьинская область',
    district: 'Гузарский район',
    country: 'Uzbekistan',
    country_code: 'UZ',
    coordinates: { lat: 38.4595, lng: 65.7993 },
    coord_precision: 'exact' as CoordPrecision,
    status: 'operational',
    capacity: 6.5,
    capacity_unit: 'млрд м³/год',
    operator: 'Узбекнефтегаз',
    description:
      'Одно из опорных газовых месторождений Узбекистана. Питает Шуртанский газохимический комплекс. Доказанные запасы оцениваются в 651 млрд м³, остаточные — около 78,5 млрд м³.',
    tags: ['газ', 'месторождение', 'Узбекистан', 'Кашкадарья'],
    sources: ['Global Energy Monitor — Global Oil and Gas Extraction Tracker'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GCC-001',
    name: 'Shurtan Gas Chemical Complex',
    name_ru: 'Шуртанский газохимический комплекс',
    type: 'gas_chemical_complex',
    type_label: 'Газохимический комплекс',
    domain: 'oilgas',
    region: 'Кашкадарьинская область',
    district: 'Гузарский район',
    country: 'Uzbekistan',
    country_code: 'UZ',
    coordinates: { lat: 38.458814, lng: 65.805875 },
    coord_precision: 'exact' as CoordPrecision,
    status: 'operational',
    capacity: 125000,
    capacity_unit: 'т/год полиэтилена',
    year_built: 2001,
    operator: 'Узбекнефтегаз',
    description:
      'Переработка газа Шуртана в полиэтилен, сжиженный газ и газовый конденсат. Запущен в 2001 году.',
    tags: ['газохимия', 'полиэтилен', 'Узбекистан', 'Кашкадарья'],
    sources: ['Global Energy Monitor', 'Uzbekneftegaz'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GTL-001',
    name: 'Uzbekistan GTL (Oltin Yo\'l GTL)',
    name_ru: 'Uzbekistan GTL («Олтин Йўл GTL»)',
    type: 'gtl_plant',
    type_label: 'Завод GTL (газ в жидкость)',
    domain: 'oilgas',
    region: 'Кашкадарьинская область',
    district: 'Гузарский район',
    country: 'Uzbekistan',
    country_code: 'UZ',
    // Площадка примыкает к Шуртанскому комплексу; собственная координата в
    // открытых источниках не подтверждена, поэтому взята координата комплекса.
    coordinates: { lat: 38.458814, lng: 65.805875 },
    coord_precision: 'settlement_proxy' as CoordPrecision,
    status: 'operational',
    capacity: 3.6,
    capacity_unit: 'млрд м³/год сырья',
    year_built: 2021,
    operator: 'Uzbekistan GTL LLC',
    description:
      'Синтетическое топливо по технологии Sasol Slurry Phase Distillate. Введён 25 декабря 2021 года. Проектный выпуск: 724 тыс. т дизельного топлива, 437 тыс. т нафты, 307 тыс. т керосина, 53 тыс. т сжиженного газа в год. Оценки стоимости строительства в источниках расходятся (3,6–5,6 млрд долл.), поэтому одна цифра не приводится.',
    tags: ['GTL', 'синтетическое топливо', 'Fischer-Tropsch', 'Узбекистан'],
    sources: ['Uzbekneftegaz', 'Sasol', 'Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GF-002',
    name: 'Gazli Gas Field',
    name_ru: 'Месторождение Газли',
    type: 'gas_field',
    type_label: 'Газовое месторождение',
    domain: 'oilgas',
    region: 'Бухарская область',
    country: 'Uzbekistan',
    country_code: 'UZ',
    coordinates: { lat: 40.13, lng: 63.46 },
    coord_precision: 'field_centroid' as CoordPrecision,
    status: 'operational',
    year_built: 1956,
    operator: 'Узбекнефтегаз',
    description:
      'Открыто в 1956 году, первое крупное газовое месторождение республики; с него начались поставки узбекского газа в Россию. Часть выработанных горизонтов переведена в подземное хранилище газа. Оценки запасов в источниках расходятся (470 / 500 / 700 / 714 млрд м³) — единая цифра не приводится.',
    tags: ['газ', 'месторождение', 'ПХГ', 'Узбекистан', 'Бухара'],
    sources: ['Global Energy Monitor', 'Wikipedia (Gazli gas field)'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GPC-001',
    name: 'Kandym Gas Processing Complex',
    name_ru: 'Кандымский газоперерабатывающий комплекс',
    type: 'gas_processing_plant',
    type_label: 'Газоперерабатывающий комплекс',
    domain: 'oilgas',
    region: 'Бухарская область',
    district: 'Каракульский район',
    country: 'Uzbekistan',
    country_code: 'UZ',
    coordinates: { lat: 39.8059, lng: 63.502 },
    coord_precision: 'exact' as CoordPrecision,
    status: 'operational',
    capacity: 8.0,
    capacity_unit: 'млрд м³/год',
    year_built: 2018,
    operator: 'Lukoil Uzbekistan Operating Company (90%) / Узбекнефтегаз (10%)',
    description:
      'Переработка газа Кандымской группы месторождений. Введён в 2018 году, работает по соглашению о разделе продукции до 2046 года. Запасы группы — около 273 млрд м³.',
    tags: ['газопереработка', 'СРП', 'Узбекистан', 'Бухара'],
    sources: ['Lukoil', 'Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GF-003',
    name: 'Dengizkul (Khauzak–Shady)',
    name_ru: 'Денгизкуль (Хаузак–Шады)',
    type: 'gas_field',
    type_label: 'Газовое месторождение',
    domain: 'oilgas',
    region: 'Бухарская область',
    country: 'Uzbekistan',
    country_code: 'UZ',
    coordinates: { lat: 39.1519, lng: 64.0125 },
    coord_precision: 'field_centroid' as CoordPrecision,
    status: 'operational',
    year_built: 2007,
    operator: 'Lukoil Uzbekistan Operating Company',
    description:
      'Участок Хаузак–Шады месторождения Денгизкуль. Первый газ получен в 2007 году, разработка ведётся по соглашению о разделе продукции.',
    tags: ['газ', 'месторождение', 'СРП', 'Узбекистан', 'Бухара'],
    sources: ['Lukoil', 'Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GPZ-001',
    name: 'Mubarek Gas Processing Plant',
    name_ru: 'Мубарекский газоперерабатывающий завод',
    type: 'gas_processing_plant',
    type_label: 'Газоперерабатывающий завод',
    domain: 'oilgas',
    region: 'Кашкадарьинская область',
    country: 'Uzbekistan',
    country_code: 'UZ',
    // Координата площадки завода не подтверждена; взята точка города Мубарек.
    coordinates: { lat: 39.26, lng: 65.15 },
    coord_precision: 'settlement_proxy' as CoordPrecision,
    status: 'operational',
    operator: 'Узбекнефтегаз',
    description:
      'Очистка газа от серы и выпуск сжиженного газа и серы. В 2020 году введён четвёртый блок сероочистки: 3 млрд м³/год сырья и 38,4 тыс. т/год сжиженного газа, стоимость 75 млн долл. Совокупная мощность завода в источниках расходится (24 / 30 / 31 млрд м³/год) — единая цифра не приводится.',
    tags: ['газопереработка', 'сероочистка', 'Узбекистан', 'Кашкадарья'],
    sources: ['Uzbekneftegaz', 'Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-REF-001',
    name: 'Fergana Refinery',
    name_ru: 'Ферганский нефтеперерабатывающий завод',
    type: 'refinery',
    type_label: 'Нефтеперерабатывающий завод',
    domain: 'oilgas',
    region: 'Ферганская область',
    country: 'Uzbekistan',
    country_code: 'UZ',
    coordinates: { lat: 40.446148, lng: 71.794354 },
    coord_precision: 'exact' as CoordPrecision,
    status: 'operational',
    capacity: 5.5,
    capacity_unit: 'млн т/год',
    year_built: 1959,
    description:
      'Старейший НПЗ республики, введён в 1959 году. Приватизирован в 2022 году; структура собственности в открытых источниках подтверждается неоднозначно, поэтому оператор не указан.',
    tags: ['нефтепереработка', 'НПЗ', 'Узбекистан', 'Фергана'],
    sources: ['Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-REF-002',
    name: 'Bukhara Refinery',
    name_ru: 'Бухарский нефтеперерабатывающий завод',
    type: 'refinery',
    type_label: 'Нефтеперерабатывающий завод',
    domain: 'oilgas',
    region: 'Бухарская область',
    district: 'Каравулбазарский район',
    country: 'Uzbekistan',
    country_code: 'UZ',
    // Координата площадки не подтверждена; взята точка Каравулбазара.
    coordinates: { lat: 39.5, lng: 64.8 },
    coord_precision: 'settlement_proxy' as CoordPrecision,
    status: 'operational',
    capacity: 2.5,
    capacity_unit: 'млн т/год',
    year_built: 1997,
    operator: 'Узбекнефтегаз',
    description:
      'Первая очередь пущена 22 августа 1997 года. Перерабатывает конденсат и нефть, в том числе с месторождения Кокдумалак.',
    tags: ['нефтепереработка', 'НПЗ', 'Узбекистан', 'Бухара'],
    sources: ['Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-UZ-GCC-002',
    name: 'Ustyurt Gas Chemical Complex',
    name_ru: 'Устюртский газохимический комплекс',
    type: 'gas_chemical_complex',
    type_label: 'Газохимический комплекс',
    domain: 'oilgas',
    region: 'Республика Каракалпакстан',
    district: 'Кунградский район',
    country: 'Uzbekistan',
    country_code: 'UZ',
    // Координата площадки не подтверждена ни одним источником; чтобы объект был
    // виден на карте региона, взят административный центр Каракалпакстана.
    coordinates: { lat: 42.46, lng: 59.61 },
    coord_precision: 'region_proxy' as CoordPrecision,
    status: 'operational',
    capacity: 4.5,
    capacity_unit: 'млрд м³/год',
    year_built: 2016,
    operator: 'Uz-Kor Gas Chemical (Узбекнефтегаз 50% / Kor-Uz 50%)',
    description:
      'Переработка газа месторождения Сургиль. Введён 21 мая 2016 года. Проектный выпуск: 387 тыс. т полиэтилена высокой плотности и 83 тыс. т полипропилена в год, собственная ТЭЦ 96,8 МВт. Финансирование — синдицированный кредит 2,54 млрд долл.',
    tags: ['газохимия', 'полиэтилен', 'полипропилен', 'Каракалпакстан'],
    sources: ['Uz-Kor Gas Chemical', 'Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
  {
    id: 'OG-KZ-OF-001',
    name: 'Tengiz Oil Field',
    name_ru: 'Месторождение Тенгиз',
    type: 'oil_field',
    type_label: 'Нефтяное месторождение',
    domain: 'oilgas',
    region: 'Атырауская область',
    country: 'Kazakhstan',
    country_code: 'KZ',
    coordinates: { lat: 46.15278, lng: 53.38333 },
    coord_precision: 'exact' as CoordPrecision,
    status: 'operational',
    capacity: 870000,
    capacity_unit: 'барр./сут',
    operator: 'Тенгизшевройл (Chevron 50% / ExxonMobil 25% / КазМунайГаз 20% / LukArco 5%)',
    description:
      'Крупнейшее нефтяное месторождение Казахстана. Извлекаемые запасы оцениваются в 1,4 млрд т. Добыча на январь 2025 года — около 870 тыс. баррелей в сутки.',
    tags: ['нефть', 'месторождение', 'Казахстан', 'Атырау'],
    sources: ['Tengizchevroil', 'Global Energy Monitor'],
    last_updated: '2026-09-04',
  },
];
