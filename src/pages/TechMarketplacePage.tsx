/**
 * TechMarketplacePage — Technology Procurement Marketplace
 * Equipment · Suppliers · Engineering Teams · Contractors · Startups
 * Route: /tech-marketplace
 */

import { useState, useMemo } from 'react';
import {
  Search, Store, Package, Building2, HardHat, Rocket,
  Microscope, Star, CheckCircle, Clock, Globe, Users,
  Zap, Shield, ChevronDown, X, ExternalLink, Mail,
  Phone, MapPin, Award, TrendingUp, Briefcase, Cpu,
  Filter, BadgeCheck, ArrowRight, DollarSign,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Equipment {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  country: string;
  countryFlag: string;
  description: string;
  specs: { key: string; value: string }[];
  certifications: string[];
  price: string;
  leadTime: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  imageEmoji: string;
  verified: boolean;
}

interface Supplier {
  id: string;
  name: string;
  country: string;
  flag: string;
  type: string;
  specialization: string[];
  established: number;
  employees: string;
  rating: number;
  completedProjects: number;
  certifications: string[];
  description: string;
  contacts: { email: string; website: string };
  verified: boolean;
  partnerLevel: 'platinum' | 'gold' | 'silver' | null;
}

interface Team {
  id: string;
  name: string;
  type: string;
  lead: string;
  location: string;
  flag: string;
  specialization: string[];
  teamSize: number;
  hourlyRate: string;
  availability: 'available' | 'busy' | 'partial';
  completedProjects: number;
  rating: number;
  languages: string[];
  certifications: string[];
  bio: string;
}

interface Startup {
  id: string;
  name: string;
  country: string;
  flag: string;
  stage: 'MVP' | 'Seed' | 'Series A' | 'Growth';
  tagline: string;
  technology: string;
  seeking: string;
  raised: string;
  teamSize: number;
  founded: number;
  tags: string[];
  description: string;
  highlight: string;
}

interface TechCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  useCases: string[];
  vendors: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EQUIPMENT_DATA: Equipment[] = [
  {
    id: 'eq-1',
    name: 'KSB Multitec Насосная станция',
    category: 'Насосы',
    manufacturer: 'KSB AG',
    country: 'Германия',
    countryFlag: '🇩🇪',
    description: 'Высокоэффективная многоступенчатая насосная станция для промышленного водоснабжения с интегрированной SCADA-системой и автоматическим управлением.',
    specs: [
      { key: 'Производительность', value: '2500 м³/ч' },
      { key: 'Напор', value: '180 м' },
      { key: 'Мощность', value: '1200 кВт' },
    ],
    certifications: ['ISO 9001', 'CE', 'ATEX'],
    price: 'от $45,000',
    leadTime: '10-14 недель',
    rating: 4.8,
    reviews: 124,
    inStock: false,
    imageEmoji: '🏭',
    verified: true,
  },
  {
    id: 'eq-2',
    name: 'Endress+Hauser Promag Расходомер',
    category: 'Датчики',
    manufacturer: 'Endress+Hauser',
    country: 'Германия',
    countryFlag: '🇩🇪',
    description: 'Электромагнитный расходомер для точного измерения объёмного расхода проводящих жидкостей в системах водоснабжения и ирригации.',
    specs: [
      { key: 'Диаметр DN', value: '25–2000 мм' },
      { key: 'Точность', value: '±0.2%' },
      { key: 'Интерфейс', value: 'HART/Profibus' },
    ],
    certifications: ['ATEX', 'IECEx', 'CE'],
    price: 'от $8,200',
    leadTime: '4-6 недель',
    rating: 4.9,
    reviews: 287,
    inStock: true,
    imageEmoji: '📡',
    verified: true,
  },
  {
    id: 'eq-3',
    name: 'Grundfos CR Вертикальный насос',
    category: 'Насосы',
    manufacturer: 'Grundfos',
    country: 'Дания',
    countryFlag: '🇩🇰',
    description: 'Вертикальный многоступенчатый центробежный насос серии CR для водоснабжения, повышения давления и промышленных применений.',
    specs: [
      { key: 'Производительность', value: 'до 150 м³/ч' },
      { key: 'Макс. напор', value: '250 м' },
      { key: 'Эффективность', value: 'IE3+' },
    ],
    certifications: ['ISO 9001', 'CE', 'WRAS'],
    price: 'от $12,400',
    leadTime: '6-8 недель',
    rating: 4.7,
    reviews: 412,
    inStock: true,
    imageEmoji: '⚙️',
    verified: true,
  },
  {
    id: 'eq-4',
    name: 'Siemens SITRANS Уровнемер',
    category: 'Датчики',
    manufacturer: 'Siemens',
    country: 'Германия',
    countryFlag: '🇩🇪',
    description: 'Ультразвуковой и радарный уровнемер для измерения уровня воды в резервуарах, каналах и водохранилищах с дистанционной передачей данных.',
    specs: [
      { key: 'Диапазон', value: '0.1–70 м' },
      { key: 'Точность', value: '±2 мм' },
      { key: 'Выход', value: '4–20 мА / IO-Link' },
    ],
    certifications: ['CE', 'ATEX', 'UL'],
    price: 'от $3,800',
    leadTime: '3-5 недель',
    rating: 4.6,
    reviews: 198,
    inStock: true,
    imageEmoji: '📊',
    verified: true,
  },
  {
    id: 'eq-5',
    name: 'Pall Промышленный фильтр',
    category: 'Фильтрация',
    manufacturer: 'Pall Corporation',
    country: 'США',
    countryFlag: '🇺🇸',
    description: 'Высокоэффективные системы микрофильтрации и ультрафильтрации для очистки промышленной и питьевой воды. Мембранная технология нового поколения.',
    specs: [
      { key: 'Тип мембраны', value: 'ПВД/PVDF' },
      { key: 'Пор. диаметр', value: '0.1–0.45 мкм' },
      { key: 'Произв.', value: 'до 5000 м³/сут' },
    ],
    certifications: ['NSF/ANSI 61', 'ISO 9001', 'CE'],
    price: 'по запросу',
    leadTime: '12-16 недель',
    rating: 4.7,
    reviews: 89,
    inStock: false,
    imageEmoji: '🔬',
    verified: true,
  },
  {
    id: 'eq-6',
    name: 'O2 Technologies Сенсор качества воды',
    category: 'Датчики',
    manufacturer: 'O2 Technologies Ltd.',
    country: 'Израиль',
    countryFlag: '🇮🇱',
    description: 'Многопараметрический онлайн-анализатор качества воды: pH, мутность, проводимость, растворённый кислород, нитраты. IoT-интеграция.',
    specs: [
      { key: 'Параметры', value: '8-в-1' },
      { key: 'Передача', value: '4G/NB-IoT' },
      { key: 'Защита', value: 'IP68' },
    ],
    certifications: ['CE', 'ISO 17025', 'FCC'],
    price: 'от $6,500',
    leadTime: '4-6 недель',
    rating: 4.5,
    reviews: 67,
    inStock: true,
    imageEmoji: '💧',
    verified: true,
  },
  {
    id: 'eq-7',
    name: 'UzWaterEquip Труба ВЧШГ DN600',
    category: 'Трубопроводы',
    manufacturer: 'UzWaterEquip',
    country: 'Узбекистан',
    countryFlag: '🇺🇿',
    description: 'Трубы из высокопрочного чугуна с шаровидным графитом (ВЧШГ) диаметром DN600 с цементно-песчаным покрытием для магистральных водоводов.',
    specs: [
      { key: 'Диаметр', value: 'DN600' },
      { key: 'Длина', value: '5–6 м' },
      { key: 'Давление', value: 'PN16–40' },
    ],
    certifications: ['ГОСТ 21424', 'ISO 2531', 'CE'],
    price: 'от $180/м',
    leadTime: '4-8 недель',
    rating: 4.1,
    reviews: 203,
    inStock: true,
    imageEmoji: '🔩',
    verified: false,
  },
  {
    id: 'eq-8',
    name: 'Allen-Bradley ПЛК SCADA',
    category: 'Автоматизация',
    manufacturer: 'Rockwell Automation',
    country: 'США',
    countryFlag: '🇺🇸',
    description: 'Программируемый логический контроллер серии ControlLogix для автоматизации насосных станций и водоочистных сооружений с интеграцией SCADA/HMI.',
    specs: [
      { key: 'Сеть', value: 'EtherNet/IP' },
      { key: 'Памяти', value: '4 МБ' },
      { key: 'I/O модули', value: 'до 128' },
    ],
    certifications: ['UL', 'CE', 'ATEX', 'IEC 61131'],
    price: 'от $24,000',
    leadTime: '8-12 недель',
    rating: 4.8,
    reviews: 156,
    inStock: false,
    imageEmoji: '🖥️',
    verified: true,
  },
  {
    id: 'eq-9',
    name: 'Xylem Водоочистная система',
    category: 'Фильтрация',
    manufacturer: 'Xylem Inc.',
    country: 'США',
    countryFlag: '🇺🇸',
    description: 'Комплексная система водоочистки с биологической и химической ступенями для муниципального и промышленного водоснабжения. Производительность до 50 000 м³/сут.',
    specs: [
      { key: 'Производит.', value: '50 000 м³/сут' },
      { key: 'Очистка', value: 'III ступени' },
      { key: 'Автоматизация', value: 'полная' },
    ],
    certifications: ['NSF 61', 'ISO 9001', 'CE', 'EPA'],
    price: 'от $180,000',
    leadTime: '20-24 недели',
    rating: 4.9,
    reviews: 43,
    inStock: false,
    imageEmoji: '🏗️',
    verified: true,
  },
  {
    id: 'eq-10',
    name: 'Ирригационный насос HCP',
    category: 'Насосы',
    manufacturer: 'Hangzhou Chinabase Pump',
    country: 'Корея',
    countryFlag: '🇰🇷',
    description: 'Горизонтальный центробежный насос для ирригационных систем и перекачки воды в каналах. Высокая надёжность при работе с загрязнёнными жидкостями.',
    specs: [
      { key: 'Производит.', value: '1200 м³/ч' },
      { key: 'Напор', value: '45 м' },
      { key: 'КПД', value: '88%' },
    ],
    certifications: ['ISO 9001', 'CE', 'KS'],
    price: 'от $28,000',
    leadTime: '8-10 недель',
    rating: 4.3,
    reviews: 78,
    inStock: true,
    imageEmoji: '🔄',
    verified: false,
  },
  {
    id: 'eq-11',
    name: 'ABB Частотный преобразователь',
    category: 'Автоматизация',
    manufacturer: 'ABB',
    country: 'Швеция',
    countryFlag: '🇸🇪',
    description: 'Частотный преобразователь серии ACQ580 специально спроектирован для водяных насосов и вентиляторов. Экономия энергии до 50%.',
    specs: [
      { key: 'Мощность', value: '0.75–250 кВт' },
      { key: 'Напряжение', value: '380–690 В' },
      { key: 'Связь', value: 'Modbus/Profinet' },
    ],
    certifications: ['CE', 'UL', 'cUL', 'ISO 9001'],
    price: 'от $15,000',
    leadTime: '6-8 недель',
    rating: 4.7,
    reviews: 234,
    inStock: true,
    imageEmoji: '⚡',
    verified: true,
  },
  {
    id: 'eq-12',
    name: 'Aqua-Pure Ультрафильтрация',
    category: 'Фильтрация',
    manufacturer: 'Aqua-Pure Technologies',
    country: 'Израиль',
    countryFlag: '🇮🇱',
    description: 'Мобильная система ультрафильтрации для опреснения и очистки воды в отдалённых районах. Работает на солнечной энергии. Производительность 500–5000 м³/сут.',
    specs: [
      { key: 'Производит.', value: '5000 м³/сут' },
      { key: 'Солёность на входе', value: 'до 45 г/л' },
      { key: 'Питание', value: 'сеть/солнце' },
    ],
    certifications: ['CE', 'WHO', 'ISO 13485'],
    price: 'от $95,000',
    leadTime: '12-16 недель',
    rating: 4.6,
    reviews: 31,
    inStock: false,
    imageEmoji: '🌊',
    verified: true,
  },
];

const SUPPLIERS_DATA: Supplier[] = [
  {
    id: 'sup-1',
    name: 'KSB AG',
    country: 'Германия',
    flag: '🇩🇪',
    type: 'Производитель',
    specialization: ['Насосы', 'Арматура', 'Системы управления'],
    established: 1871,
    employees: '15,000+',
    rating: 4.9,
    completedProjects: 847,
    certifications: ['ISO 9001', 'ISO 14001', 'CE', 'ATEX'],
    description: 'Ведущий мировой производитель насосов и промышленной арматуры с 150-летним опытом в водной отрасли. Комплексные решения для водоснабжения и водоотведения.',
    contacts: { email: 'info@ksb.com', website: 'ksb.com' },
    verified: true,
    partnerLevel: 'platinum',
  },
  {
    id: 'sup-2',
    name: 'АО "УзВодМаш"',
    country: 'Узбекистан',
    flag: '🇺🇿',
    type: 'Производитель',
    specialization: ['Трубопроводы', 'ЖБИ', 'Водохозяйственное оборудование'],
    established: 1968,
    employees: '2,400',
    rating: 4.3,
    completedProjects: 312,
    certifications: ['ГОСТ 21424', 'ISO 9001', 'СТ РУз'],
    description: 'Крупнейший узбекский производитель трубопроводных изделий и железобетонных конструкций для водохозяйственного строительства. Поставщик ключевых инфраструктурных проектов.',
    contacts: { email: 'info@uzvodomasch.uz', website: 'uzvodomasch.uz' },
    verified: true,
    partnerLevel: 'gold',
  },
  {
    id: 'sup-3',
    name: 'Mott MacDonald',
    country: 'Великобритания',
    flag: '🇬🇧',
    type: 'Консультант',
    specialization: ['Проектирование ГТС', 'Технический надзор', 'ESG-аудит'],
    established: 1902,
    employees: '16,000+',
    rating: 4.8,
    completedProjects: 2100,
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'ICE'],
    description: 'Глобальная инжиниринговая и проектная компания. Реализовала более 2100 проектов в водной отрасли по всему миру, включая крупнейшие ирригационные системы Центральной Азии.',
    contacts: { email: 'water@mottmac.com', website: 'mottmac.com' },
    verified: true,
    partnerLevel: 'platinum',
  },
  {
    id: 'sup-4',
    name: 'Grundfos Central Asia',
    country: 'Казахстан',
    flag: '🇰🇿',
    type: 'Дистрибьютор',
    specialization: ['Насосы Grundfos', 'Сервис и ТО', 'Обучение персонала'],
    established: 2005,
    employees: '85',
    rating: 4.5,
    completedProjects: 220,
    certifications: ['ISO 9001', 'Grundfos Certified Partner'],
    description: 'Официальный дистрибьютор Grundfos в Центральной Азии. Полный спектр насосного оборудования, технического обслуживания и инжиниринговой поддержки.',
    contacts: { email: 'sales@grundfos.kz', website: 'grundfos.kz' },
    verified: true,
    partnerLevel: 'gold',
  },
  {
    id: 'sup-5',
    name: 'Промводстрой',
    country: 'Россия',
    flag: '🇷🇺',
    type: 'Подрядчик',
    specialization: ['Строительство ГТС', 'Прокладка трубопроводов', 'Дамбы и плотины'],
    established: 1994,
    employees: '850',
    rating: 4.1,
    completedProjects: 178,
    certifications: ['СРО', 'ISO 9001', 'ГОСТ'],
    description: 'Специализированный строительный подрядчик в области гидротехнических сооружений. Опыт строительства каналов, дамб, насосных станций и систем водоснабжения.',
    contacts: { email: 'info@promvodstroy.ru', website: 'promvodstroy.ru' },
    verified: false,
    partnerLevel: 'silver',
  },
  {
    id: 'sup-6',
    name: 'IDE Technologies',
    country: 'Израиль',
    flag: '🇮🇱',
    type: 'Производитель',
    specialization: ['Опреснение воды', 'Промышленная очистка', 'SWRO/BWRO'],
    established: 1965,
    employees: '1,200',
    rating: 4.7,
    completedProjects: 430,
    certifications: ['ISO 9001', 'ISO 14001', 'CE', 'WHO'],
    description: 'Мировой лидер в технологиях опреснения воды. Реализовала крупнейшие SWRO-установки в мире. Также производит системы промышленной очистки и рекуперации воды.',
    contacts: { email: 'info@ide-tech.com', website: 'ide-tech.com' },
    verified: true,
    partnerLevel: 'gold',
  },
  {
    id: 'sup-7',
    name: 'Technip Energies',
    country: 'Франция',
    flag: '🇫🇷',
    type: 'EPC-подрядчик',
    specialization: ['Комплексные EPC-проекты', 'Водная инфраструктура', 'Цифровизация ГТС'],
    established: 1958,
    employees: '15,000+',
    rating: 4.6,
    completedProjects: 890,
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 45001', 'CE'],
    description: 'Ведущий международный EPC-подрядчик с глубокой экспертизой в проектировании, строительстве и запуске объектов водной инфраструктуры в 70+ странах.',
    contacts: { email: 'water@technipfmc.com', website: 'technipenergie.com' },
    verified: true,
    partnerLevel: 'platinum',
  },
  {
    id: 'sup-8',
    name: 'ЦентрВодПроект',
    country: 'Узбекистан',
    flag: '🇺🇿',
    type: 'Проектировщик',
    specialization: ['Гидрология', 'ТЭО проектов', 'Экологические оценки'],
    established: 1988,
    employees: '340',
    rating: 4.2,
    completedProjects: 156,
    certifications: ['СРО УЗ', 'ISO 9001', 'ЮНЕСКО'],
    description: 'Ведущий узбекский проектный институт в области водного хозяйства. Разработал ТЭО и проектную документацию для более 156 объектов водной инфраструктуры страны.',
    contacts: { email: 'info@cvp.uz', website: 'cvp.uz' },
    verified: true,
    partnerLevel: 'silver',
  },
];

const TEAMS_DATA: Team[] = [
  {
    id: 'team-1',
    name: 'AquaEngineers Pro',
    type: 'Инженерная команда',
    lead: 'Алишер Турсунов',
    location: 'Ташкент',
    flag: '🇺🇿',
    specialization: ['Гидравлические расчёты', 'SCADA-проектирование', 'Насосные станции'],
    teamSize: 12,
    hourlyRate: '$85/ч',
    availability: 'available',
    completedProjects: 34,
    rating: 4.8,
    languages: ['Узбекский', 'Русский', 'Английский'],
    certifications: ['PMP', 'Grundfos Certified', 'AutoCAD'],
    bio: 'Специализированная инженерная команда по проектированию насосных станций и систем водоснабжения. Опыт реализации проектов от 500 000$ до 15 млн$.',
  },
  {
    id: 'team-2',
    name: 'HydroConstruct',
    type: 'Строительная бригада',
    lead: 'Нурлан Сейткали',
    location: 'Алматы',
    flag: '🇰🇿',
    specialization: ['Строительство каналов', 'Прокладка трубопроводов', 'Дамбы'],
    teamSize: 45,
    hourlyRate: '$55/ч',
    availability: 'partial',
    completedProjects: 89,
    rating: 4.4,
    languages: ['Казахский', 'Русский'],
    certifications: ['СРО', 'ISO 45001', 'Hydro Cert'],
    bio: 'Опытная строительная бригада с парком специализированной техники для гидротехнического строительства. Работаем в Казахстане, Узбекистане и Кыргызстане.',
  },
  {
    id: 'team-3',
    name: 'Water Diagnostics Lab',
    type: 'Консалтинг',
    lead: 'Dr. Klaus Weber',
    location: 'Берлин',
    flag: '🇩🇪',
    specialization: ['Качество воды', 'Экологические аудиты', 'Технические экспертизы'],
    teamSize: 8,
    hourlyRate: '$150/ч',
    availability: 'available',
    completedProjects: 156,
    rating: 4.9,
    languages: ['Немецкий', 'Английский', 'Русский'],
    certifications: ['ISO 17025', 'EurAqua', 'WHO Expert'],
    bio: 'Аккредитованная лаборатория и консалтинговая служба по диагностике водных систем. Проводим полный анализ: микробиологию, химию, физику воды и инфраструктурный аудит.',
  },
  {
    id: 'team-4',
    name: 'ИрригТехСтрой',
    type: 'Строительная бригада',
    lead: 'Бахтиёр Рашидов',
    location: 'Фергана',
    flag: '🇺🇿',
    specialization: ['Ирригационные каналы', 'Дренажные системы', 'Коллекторы'],
    teamSize: 28,
    hourlyRate: '$40/ч',
    availability: 'busy',
    completedProjects: 67,
    rating: 4.2,
    languages: ['Узбекский', 'Русский'],
    certifications: ['СРО УЗ', 'Агроирригация Cert'],
    bio: 'Строительная бригада с глубоким опытом в ферганском регионе. Специализируемся на строительстве и реконструкции ирригационных каналов и дренажных систем.',
  },
  {
    id: 'team-5',
    name: 'Hydrology Solutions',
    type: 'Консалтинг',
    lead: 'Дмитрий Волков',
    location: 'Москва',
    flag: '🇷🇺',
    specialization: ['Гидрологические модели', 'Паводковый анализ', 'Речные бассейны'],
    teamSize: 15,
    hourlyRate: '$90/ч',
    availability: 'available',
    completedProjects: 112,
    rating: 4.6,
    languages: ['Русский', 'Английский'],
    certifications: ['РАН', 'IAHR Member', 'HEC-RAS'],
    bio: 'Консалтинговая компания по гидрологическому моделированию и анализу водных ресурсов. Разрабатываем числовые модели бассейнов рек, прогнозы паводков и засух.',
  },
  {
    id: 'team-6',
    name: 'Central Asia Water Tech',
    type: 'Инженерная команда',
    lead: 'Айгуль Мамытова',
    location: 'Бишкек',
    flag: '🇰🇬',
    specialization: ['IoT-мониторинг', 'Автоматизация', 'ГИС-картирование'],
    teamSize: 9,
    hourlyRate: '$70/ч',
    availability: 'partial',
    completedProjects: 28,
    rating: 4.5,
    languages: ['Кыргызский', 'Русский', 'Английский'],
    certifications: ['Cisco IoT', 'ESRI GIS', 'Siemens Cert'],
    bio: 'Молодая инженерная команда, специализирующаяся на цифровизации водной инфраструктуры: IoT-датчики, облачный мониторинг, ГИС-системы и автоматизация управления.',
  },
];

const STARTUPS_DATA: Startup[] = [
  {
    id: 'st-1',
    name: 'AquaSense AI',
    country: 'Израиль',
    flag: '🇮🇱',
    stage: 'Series A',
    tagline: 'Предсказывает загрязнение воды за 72 часа до наступления',
    technology: 'IoT + машинное обучение для мониторинга качества воды',
    seeking: 'Пилот-партнёр',
    raised: '$4.2M',
    teamSize: 23,
    founded: 2021,
    tags: ['IoT', 'AI', 'Качество воды', 'Предиктивная аналитика'],
    description: 'Платформа раннего обнаружения загрязнений в водных системах с использованием сети IoT-датчиков и нейросетевых моделей. Уже развёрнута в 12 городах.',
    highlight: 'Точность прогнозирования 94.3% — лучший показатель в отрасли',
  },
  {
    id: 'st-2',
    name: 'DropLogic',
    country: 'Германия',
    flag: '🇩🇪',
    stage: 'Seed',
    tagline: 'ML-оптимизация расписания полива экономит 35% воды',
    technology: 'Машинное обучение для оптимизации ирригации',
    seeking: 'Инвестиции',
    raised: '$800K',
    teamSize: 8,
    founded: 2023,
    tags: ['ML', 'Ирригация', 'Точное земледелие', 'SaaS'],
    description: 'SaaS-платформа для фермеров и агрохолдингов: алгоритм DropLogic анализирует метеоданные, почву и культуры, автоматически оптимизируя расписание и норму полива.',
    highlight: 'Экономия воды 35% при росте урожайности +12% на пилотных фермах',
  },
  {
    id: 'st-3',
    name: 'WaterChain',
    country: 'Сингапур',
    flag: '🇸🇬',
    stage: 'MVP',
    tagline: 'Блокчейн-реестр водных прав и торговли на Центральную Азию',
    technology: 'Blockchain + смарт-контракты для учёта водных прав',
    seeking: 'Пилот-партнёр',
    raised: '$120K',
    teamSize: 5,
    founded: 2024,
    tags: ['Blockchain', 'Web3', 'Водные права', 'DLT'],
    description: 'Децентрализованная платформа для прозрачного учёта водных прав, автоматических расчётов и торговли водными квотами. MVP разработан для условий Узбекистана и Казахстана.',
    highlight: 'Первый блокчейн-реестр водных прав, адаптированный под законодательство ЦА',
  },
  {
    id: 'st-4',
    name: 'IrriBot',
    country: 'Узбекистан',
    flag: '🇺🇿',
    stage: 'Seed',
    tagline: 'Роботизированная система капельного орошения с ИИ-управлением',
    technology: 'Робототехника + ИИ для автоматизации ирригации',
    seeking: 'Лицензирование',
    raised: '$350K',
    teamSize: 12,
    founded: 2022,
    tags: ['Роботы', 'Ирригация', 'AgriTech', 'Hardware'],
    description: 'Первый узбекский стартап в области ирригационной робототехники. Разработали умную систему капельного полива с мобильными роботами, устанавливающими датчики и контролирующими норму подачи воды.',
    highlight: 'Снижение трудозатрат на 70% и потребления воды на 40% на хлопковых полях',
  },
  {
    id: 'st-5',
    name: 'HydroPredict',
    country: 'США',
    flag: '🇺🇸',
    stage: 'Series A',
    tagline: 'ИИ-прогнозирование паводков с точностью 96% за 7 дней',
    technology: 'Deep Learning + спутниковые данные для прогноза паводков',
    seeking: 'Пилот-партнёр',
    raised: '$6.8M',
    teamSize: 31,
    founded: 2020,
    tags: ['Deep Learning', 'Паводки', 'GovTech', 'Спутники'],
    description: 'Система раннего предупреждения о паводках на основе спутниковых снимков, гидрологических моделей и нейросетей. Уже используется в 8 странах, спасла более 50 000 жизней.',
    highlight: 'Контракты с правительствами Бангладеш, Нигерии и Пакистана',
  },
  {
    id: 'st-6',
    name: 'CleanFlow Systems',
    country: 'Франция',
    flag: '🇫🇷',
    stage: 'Growth',
    tagline: 'Мобильные нанофильтрационные установки для экстремальных условий',
    technology: 'Нанофильтрация нового поколения на мобильных платформах',
    seeking: 'Лицензирование',
    raised: '$18M',
    teamSize: 67,
    founded: 2018,
    tags: ['Нанофильтрация', 'Mobile WTP', 'Гуманитарная помощь', 'Defense'],
    description: 'Компания производит мобильные установки водоочистки, которые разворачиваются за 2 часа и дают 10 000 л/ч чистой воды из любого источника. Используются ООН и NATO.',
    highlight: 'Развёрнуто 340 установок в 42 странах, включая зоны конфликтов',
  },
  {
    id: 'st-7',
    name: 'AgriWater.uz',
    country: 'Узбекистан',
    flag: '🇺🇿',
    stage: 'MVP',
    tagline: 'Цифровая платформа управления поливом для фермеров Узбекистана',
    technology: 'SaaS + мобильное приложение для управления ирригацией',
    seeking: 'Инвестиции',
    raised: '$80K',
    teamSize: 6,
    founded: 2024,
    tags: ['AgriTech', 'SaaS', 'Mobile', 'Local'],
    description: 'Первая локализованная платформа управления поливом на узбекском языке. Помогает фермерам планировать полив, отслеживать водопотребление и взаимодействовать с водораспределительными организациями.',
    highlight: 'Уже используется 120 фермерами в Ферганской долине в пилотном режиме',
  },
  {
    id: 'st-8',
    name: 'SalinityGuard',
    country: 'Австралия',
    flag: '🇦🇺',
    stage: 'Seed',
    tagline: 'ИИ-система ранней диагностики и борьбы с засолением почв',
    technology: 'AI + спутниковый дистанционный зондинг для мониторинга засоления',
    seeking: 'Пилот-партнёр',
    raised: '$1.1M',
    teamSize: 14,
    founded: 2022,
    tags: ['AI', 'Засоление', 'Почва', 'Дистанционное зондирование'],
    description: 'Платформа анализирует спутниковые снимки и почвенные данные для раннего обнаружения засоления и мелиорационных рисков. Предлагает планы ремедиации с экономическим обоснованием.',
    highlight: 'Критически важно для Аральского бассейна — 38% пашни под угрозой засоления',
  },
];

const TECH_CATEGORIES_DATA: TechCategory[] = [
  {
    id: 'tech-1',
    title: 'Капельное орошение нового поколения',
    icon: '💧',
    description: 'Современные системы капельного орошения с интеграцией датчиков влажности, автоматическим регулированием нормы подачи и управлением через мобильные приложения. Снижение потребления воды на 30–60% по сравнению с традиционными методами полива.',
    useCases: ['Хлопководство', 'Садоводство', 'Тепличные хозяйства', 'Городское озеленение'],
    vendors: ['Netafim', 'Rain Bird', 'Hunter Industries', 'IrriBot'],
  },
  {
    id: 'tech-2',
    title: 'Smart Water Networks (IoT mesh)',
    icon: '🌐',
    description: 'Интеллектуальные водопроводные сети с распределёнными IoT-датчиками для непрерывного мониторинга давления, расхода, качества воды и раннего обнаружения утечек. Сокращение потерь воды до 25%.',
    useCases: ['Муниципальные сети', 'Промышленные предприятия', 'Ирригационные каналы', 'Насосные станции'],
    vendors: ['Xylem', 'Itron', 'Sensus', 'AquaSense AI'],
  },
  {
    id: 'tech-3',
    title: 'AI-управление насосными станциями',
    icon: '🤖',
    description: 'Системы искусственного интеллекта для оптимизации работы насосных станций: предсказание нагрузки, автоматическое регулирование скорости насосов, предиктивное обслуживание и снижение энергопотребления на 20–40%.',
    useCases: ['Насосные станции', 'Водоочистные станции', 'Подъём воды', 'Перекачивающие узлы'],
    vendors: ['Grundfos', 'KSB AI Suite', 'Xylem Vue', 'Siemens WaterGrid'],
  },
  {
    id: 'tech-4',
    title: 'Мобильные опреснительные установки',
    icon: '🏕️',
    description: 'Контейнерные и мобильные установки обратного осмоса и нанофильтрации для опреснения морской, солоноватой и загрязнённой воды. Быстрое развёртывание за 2–4 часа в любой точке без стационарной инфраструктуры.',
    useCases: ['Аварийное водоснабжение', 'Отдалённые районы', 'Военные операции', 'Строительные площадки'],
    vendors: ['CleanFlow Systems', 'IDE Technologies', 'Aqua-Pure', 'Suez Mobile'],
  },
  {
    id: 'tech-5',
    title: 'Дроны для мониторинга каналов',
    icon: '🚁',
    description: 'Беспилотные летательные аппараты с мультиспектральными камерами и лидарами для инспекции состояния каналов, выявления утечек, оценки заиления и несанкционированных водозаборов. Сокращение стоимости обследования в 5–10 раз.',
    useCases: ['Ирригационные каналы', 'Водохранилища', 'Дамбы', 'Поймы рек'],
    vendors: ['DJI AgriTech', 'senseFly', 'Parrot ANAFI', 'SkyWater Drone Co.'],
  },
  {
    id: 'tech-6',
    title: 'Спутниковая гидрология (SAR / Multispectral)',
    icon: '🛰️',
    description: 'Использование данных спутников с радарным (SAR) и мультиспектральным зондированием для оценки снежного покрова, влажности почвы, площади затопления и состояния ирригационной инфраструктуры с разрешением до 3 метров.',
    useCases: ['Бассейны рек', 'Прогноз стока', 'Мониторинг ледников', 'Паводковое предупреждение'],
    vendors: ['Planet Labs', 'Airbus Defence', 'ESA Copernicus', 'HydroPredict'],
  },
];

// ─── Helper components ─────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-yellow-400 text-sm">
      <Star className="w-3.5 h-3.5 fill-yellow-400" />
      <span className="font-medium">{rating.toFixed(1)}</span>
    </span>
  );
}

function PartnerBadge({ level }: { level: Supplier['partnerLevel'] }) {
  if (!level) return null;
  const cfg = {
    platinum: { label: 'Platinum', cls: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30' },
    gold: { label: 'Gold', cls: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30' },
    silver: { label: 'Silver', cls: 'bg-slate-400/15 text-slate-300 border-slate-400/30' },
  }[level];
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function AvailabilityBadge({ status }: { status: Team['availability'] }) {
  const cfg = {
    available: { label: 'Доступна', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    partial: { label: 'Частично', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    busy: { label: 'Занята', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  }[status];
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StageBadge({ stage }: { stage: Startup['stage'] }) {
  const cfg = {
    'MVP': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    'Seed': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'Series A': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'Growth': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }[stage];
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${cfg}`}>
      {stage}
    </span>
  );
}

// ─── Tab content components ────────────────────────────────────────────────────

function EquipmentTab({ search }: { search: string }) {
  const [category, setCategory] = useState('Всё');
  const [country, setCountry] = useState('Всё');
  const [cert, setCert] = useState('Всё');

  const categories = ['Всё', 'Насосы', 'Датчики', 'Трубопроводы', 'Фильтрация', 'Автоматизация'];
  const countries = ['Всё', 'Германия', 'Корея', 'Узбекистан', 'Израиль', 'Россия', 'США', 'Швеция', 'Дания', 'Франция'];
  const certs = ['Всё', 'ISO', 'CE', 'ГОСТ'];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EQUIPMENT_DATA.filter((eq) => {
      if (category !== 'Всё' && eq.category !== category) return false;
      if (country !== 'Всё' && eq.country !== country) return false;
      if (cert !== 'Всё' && !eq.certifications.some((c) => c.includes(cert))) return false;
      if (q && !eq.name.toLowerCase().includes(q) && !eq.description.toLowerCase().includes(q) && !eq.manufacturer.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, country, cert, search]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect label="Категория" value={category} options={categories} onChange={setCategory} />
        <FilterSelect label="Страна" value={country} options={countries} onChange={setCountry} />
        <FilterSelect label="Сертификат" value={cert} options={certs} onChange={setCert} />
        <span className="ml-auto text-white/40 text-sm flex items-center">{filtered.length} позиций</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((eq) => (
          <EquipmentCard key={eq.id} item={eq} />
        ))}
      </div>
      {filtered.length === 0 && <EmptyState />}
    </div>
  );
}

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-8 text-sm text-white/80 cursor-pointer focus:outline-none focus:border-cyan-400/50 transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#000d1f] text-white">
            {o === 'Всё' ? `${label}: ${o}` : o}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200">
      {/*
        Здесь висел бирюзовый значок «Верифицирован» с галочкой. Он означал
        лишь то, что у записи в файле стоит verified: true, — никакой проверки
        за этим нет. Значок заменён на пометку об источнике: карточка собрана
        по открытым данным производителя.
      */}
      <div className="flex flex-col items-center gap-1 relative">
        <div className="text-[72px] leading-none select-none">{item.imageEmoji}</div>
        <span className="absolute top-0 right-0 text-[10px] text-white/30 bg-white/[0.04] border border-white/[0.08] rounded-full px-2 py-0.5">
          по данным производителя
        </span>
      </div>

      {/* Name + manufacturer */}
      <div>
        <h3 className="font-semibold text-white text-base leading-snug">{item.name}</h3>
        <p className="text-white/50 text-xs mt-0.5">{item.manufacturer}</p>
      </div>

      {/* Country + category */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm">{item.countryFlag}</span>
        <span className="text-white/60 text-xs">{item.country}</span>
        <span className="ml-auto bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white/70">
          {item.category}
        </span>
      </div>

      {/* Specs */}
      <div className="flex flex-wrap gap-1.5">
        {item.specs.map((s) => (
          <span key={s.key} className="bg-white/5 rounded-lg px-2 py-1 text-xs text-white/70">
            <span className="text-white/40">{s.key}:</span> {s.value}
          </span>
        ))}
      </div>

      {/* Certifications */}
      <div className="flex flex-wrap gap-1.5">
        {item.certifications.map((c) => (
          <span key={c} className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 text-xs text-emerald-400">
            {c}
          </span>
        ))}
      </div>

      {/* Price + lead time */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">{item.price}</span>
        <span className="text-white/40 flex items-center gap-1 text-xs">
          <Clock className="w-3 h-3" /> {item.leadTime}
        </span>
      </div>

      {/* Rating + stock */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <StarRating rating={item.rating} />
          <span className="text-white/40">({item.reviews})</span>
        </div>
        <span className={item.inStock ? 'text-emerald-400' : 'text-white/40'}>
          {item.inStock ? '● В наличии' : '○ Под заказ'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button className="flex-1 py-2 rounded-xl border border-cyan-400/40 text-cyan-400 text-xs font-medium hover:bg-cyan-400/10 transition-colors">
          Запросить КП
        </button>
        <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors">
          В проект
        </button>
      </div>
    </div>
  );
}

function SuppliersTab({ search }: { search: string }) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SUPPLIERS_DATA.filter((s) =>
      !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.type.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="text-white/40 text-sm">{filtered.length} компаний</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((s) => <SupplierCard key={s.id} item={s} />)}
      </div>
      {filtered.length === 0 && <EmptyState />}
    </div>
  );
}

function SupplierCard({ item }: { item: Supplier }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{item.flag}</span>
            <h3 className="font-semibold text-white text-base">{item.name}</h3>
            {/* Значок «проверено» убран: поставщиков никто не проверял. */}
          </div>
          <span className="text-white/50 text-xs mt-0.5">{item.type} · {item.country}</span>
        </div>
        <PartnerBadge level={item.partnerLevel} />
      </div>

      {/* Description */}
      <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{item.description}</p>

      {/* Specialization */}
      <div className="flex flex-wrap gap-1.5">
        {item.specialization.map((s) => (
          <span key={s} className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white/70">{s}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Основан', value: item.established },
          { label: 'Сотр.', value: item.employees },
          { label: 'Проекты', value: item.completedProjects },
          { label: 'Рейтинг', value: item.rating.toFixed(1) },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-white font-semibold text-sm">{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Certs */}
      <div className="flex flex-wrap gap-1.5">
        {item.certifications.map((c) => (
          <span key={c} className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 text-xs text-emerald-400">{c}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded-xl border border-cyan-400/40 text-cyan-400 text-xs font-medium hover:bg-cyan-400/10 transition-colors flex items-center justify-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Связаться
        </button>
        <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" /> Портфолио
        </button>
      </div>
    </div>
  );
}

function TeamsTab({ search }: { search: string }) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TEAMS_DATA.filter((t) =>
      !q || t.name.toLowerCase().includes(q) || t.bio.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="text-white/40 text-sm">{filtered.length} команд</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => <TeamCard key={t.id} item={t} />)}
      </div>
      {filtered.length === 0 && <EmptyState />}
    </div>
  );
}

function TeamCard({ item }: { item: Team }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white">{item.name}</h3>
          <p className="text-white/50 text-xs mt-0.5">{item.flag} {item.location} · {item.lead}</p>
        </div>
        <AvailabilityBadge status={item.availability} />
      </div>

      {/* Type badge */}
      <div>
        <span className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white/70">{item.type}</span>
      </div>

      {/* Bio */}
      <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{item.bio}</p>

      {/* Specialization */}
      <div className="flex flex-wrap gap-1.5">
        {item.specialization.map((s) => (
          <span key={s} className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white/70">{s}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Команда', value: `${item.teamSize} чел.` },
          { label: 'Ставка', value: item.hourlyRate },
          { label: 'Проекты', value: item.completedProjects },
          { label: 'Рейтинг', value: item.rating.toFixed(1) },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-white font-semibold text-sm">{stat.value}</div>
            <div className="text-white/40 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Globe className="w-3.5 h-3.5 text-white/30" />
        {item.languages.map((l) => (
          <span key={l} className="text-white/50 text-xs">{l}</span>
        ))}
      </div>

      {/* Certifications */}
      <div className="flex flex-wrap gap-1.5">
        {item.certifications.map((c) => (
          <span key={c} className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 text-xs text-emerald-400">{c}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
            item.availability === 'available'
              ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-white/10 text-white/50 hover:bg-white/5'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" /> Нанять
        </button>
        <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" /> Профиль
        </button>
      </div>
    </div>
  );
}

function StartupsTab({ search }: { search: string }) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return STARTUPS_DATA.filter((s) =>
      !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="text-white/40 text-sm">{filtered.length} стартапов</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((s) => <StartupCard key={s.id} item={s} />)}
      </div>
      {filtered.length === 0 && <EmptyState />}
    </div>
  );
}

function StartupCard({ item }: { item: Startup }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{item.flag}</span>
            <h3 className="font-bold text-white text-base">{item.name}</h3>
          </div>
          <p className="text-white/50 text-xs mt-0.5">{item.country} · Основан {item.founded}</p>
        </div>
        <StageBadge stage={item.stage} />
      </div>

      {/* Tagline */}
      <p className="text-white/70 text-sm italic leading-snug">"{item.tagline}"</p>

      {/* Technology */}
      <div className="flex items-start gap-2">
        <Cpu className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
        <span className="text-white/60 text-xs">{item.technology}</span>
      </div>

      {/* Seeking + raised */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-orange-500/15 border border-orange-500/25 rounded-full px-2.5 py-0.5 text-xs text-orange-400 font-medium">
          Ищет: {item.seeking}
        </span>
        <span className="text-white/50 text-xs flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" /> Привлечено {item.raised}
        </span>
        <span className="text-white/40 text-xs ml-auto">{item.teamSize} чел.</span>
      </div>

      {/* Description */}
      <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{item.description}</p>

      {/* Highlight */}
      <div className="bg-cyan-400/8 border border-cyan-400/20 rounded-xl px-3 py-2.5">
        <p className="text-cyan-300 text-xs font-medium leading-snug">{item.highlight}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {item.tags.map((t) => (
          <span key={t} className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white/60">{t}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button className="flex-1 py-2 rounded-xl border border-cyan-400/40 text-cyan-400 text-xs font-medium hover:bg-cyan-400/10 transition-colors flex items-center justify-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Связаться
        </button>
        <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" /> Питч-дек
        </button>
      </div>
    </div>
  );
}

function TechCategoriesTab({ search }: { search: string }) {
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TECH_CATEGORIES_DATA.filter((t) =>
      !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((cat) => <TechCard key={cat.id} item={cat} />)}
      </div>
      {filtered.length === 0 && <EmptyState />}
    </div>
  );
}

function TechCard({ item }: { item: TechCategory }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="text-4xl">{item.icon}</div>
        <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
      </div>

      {/* Description */}
      <p className="text-white/65 text-sm leading-relaxed">{item.description}</p>

      {/* Use cases */}
      <div>
        <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Применения</div>
        <div className="flex flex-wrap gap-1.5">
          {item.useCases.map((u) => (
            <span key={u} className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs text-white/70">{u}</span>
          ))}
        </div>
      </div>

      {/* Vendors */}
      <div>
        <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Ведущие поставщики</div>
        <div className="flex flex-wrap gap-1.5">
          {item.vendors.map((v) => (
            <span key={v} className="bg-cyan-400/8 border border-cyan-400/15 rounded-full px-2 py-0.5 text-xs text-cyan-300">{v}</span>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="mt-auto">
        <button className="w-full py-2.5 rounded-xl border border-cyan-400/30 text-cyan-400 text-sm font-medium hover:bg-cyan-400/10 transition-colors flex items-center justify-center gap-2">
          Найти поставщика <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 text-white/30">
      <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium">Ничего не найдено</p>
      <p className="text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'equipment', label: 'Оборудование', icon: '🏭' },
  { id: 'suppliers', label: 'Поставщики', icon: '🏢' },
  { id: 'teams', label: 'Команды и подрядчики', icon: '👷' },
  { id: 'startups', label: 'Стартапы', icon: '🚀' },
  { id: 'tech', label: 'Технологии', icon: '🔬' },
] as const;

type TabId = typeof TABS[number]['id'];

const STATS = [
  { label: 'поставщиков', value: '847', icon: Building2, color: 'text-cyan-400' },
  { label: 'команды', value: '234', icon: Users, color: 'text-blue-400' },
  { label: 'стартапов', value: '89', icon: Rocket, color: 'text-purple-400' },
  { label: 'единиц оборудования', value: '12,400+', icon: Package, color: 'text-emerald-400' },
];

export default function TechMarketplacePage() {
  const [activeTab, setActiveTab] = useState<TabId>('equipment');
  const [search, setSearch] = useState('');

  return (
    <div
      className="min-h-screen text-white"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center">
              <Store className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                Маркетплейс технологий и компетенций
              </h1>
              <p className="text-white/50 text-sm mt-0.5">
                Оборудование · Поставщики · Инженерные команды · Подрядчики · Стартапы
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none w-[18px] h-[18px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию, производителю, описанию..."
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-3.5 flex items-center gap-3"
            >
              <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-white/45 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/25'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div>
          {activeTab === 'equipment' && <EquipmentTab search={search} />}
          {activeTab === 'suppliers' && <SuppliersTab search={search} />}
          {activeTab === 'teams' && <TeamsTab search={search} />}
          {activeTab === 'startups' && <StartupsTab search={search} />}
          {activeTab === 'tech' && <TechCategoriesTab search={search} />}
        </div>

        {/* ── Footer note ── */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          {/*
            Стояло: «Все верифицированные поставщики прошли проверку документов
            и референций». Такой проверки не было: ни документов, ни референций
            платформа не запрашивала и не смотрела. Флаг verified в записях —
            это пометка составителя каталога, а не результат процедуры.
            Утверждение снято, на его месте — прямой отказ от него.
          */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-white/25" />
            <span>
              Проверка документов и референций поставщиков не проводилась.
              Записи собраны по открытым данным производителей.
            </span>
          </div>
          <span>Обновлено: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

      </div>
    </div>
  );
}
