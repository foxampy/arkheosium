import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Building2, Sun, Droplets, Leaf, Users, Trees,
  TrendingDown, TrendingUp, FileText, Compass, Gauge, Wind,
  Sprout, Factory, Waves, Recycle, Train,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Regenerative City (smart eco-city on restored Aral land)
//  Route: /city
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#38bdf8';   // sky
const ACCENT2 = '#a78bfa';  // violet

const GRID_COLS = 12;
const GRID_ROWS = 8;
const CELL_COUNT = GRID_COLS * GRID_ROWS;

// District zone types
type Zone = 'residential' | 'industrial' | 'green' | 'water';

const ZONE_COLORS: Record<Zone, string> = {
  residential: '#38bdf8',
  industrial: '#fbbf24',
  green: '#22c55e',
  water: '#06b6d4',
};

const ZONE_CYCLE: Zone[] = ['residential', 'industrial', 'green', 'water'];

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Регенеративный город',
    eyebrow: 'Умный город на восстановленной земле',
    hero_title: 'Регенеративный город',
    hero_accent: 'Эко-полис на дне бывшего Арала',
    hero_lead:
      'Проектируйте кварталы нового города прямо на восстановленной суше. Меняйте плотность, долю зелени и городские вмешательства — метрики жизнепригодности и ресурсов пересчитываются в реальном времени.',
    kpi_pop: 'Ёмкость населения',
    kpi_energy: 'Доля ВИЭ',
    kpi_water: 'Рециркуляция воды',
    kpi_green: 'Зелень на человека',
    planner_eyebrow: 'Цифровой двойник города',
    planner_title: 'Планировщик кварталов',
    planner_sub:
      'Каждая ячейка — квартал. Кликайте, чтобы переключить зону: жильё → промышленность → парк → вода. Двигайте ползунки плотности и озеленения — индекс жизнепригодности реагирует мгновенно.',
    slider_density: 'Плотность застройки',
    slider_green: 'Доля озеленения',
    legend_residential: 'Жильё',
    legend_industrial: 'Промышленность',
    legend_green: 'Парки',
    legend_water: 'Вода',
    livability: 'Индекс жизнепригодности',
    balance: 'Баланс зон',
    zone_tip: 'Клик — сменить зону',
    metric_res: 'Жилых',
    metric_ind: 'Пром.',
    metric_grn: 'Парков',
    metric_wtr: 'Воды',
    interv_eyebrow: 'Городские вмешательства',
    interv_title: 'Сценарии устойчивости',
    interv_sub:
      'Включайте меры — они повышают долю ВИЭ, рециркуляцию воды и снижают выбросы на душу населения.',
    proj_energy: 'Прогноз ВИЭ',
    proj_emissions: 'Выбросы / чел',
    interv_active: 'мер активно',
    charts_eyebrow: 'Динамика до 2045',
    charts_title: 'Траектории города',
    charts_sub:
      'Население растёт, а выбросы на душу падают. Кривые перестраиваются вслед за плотностью, озеленением и вмешательствами.',
    chart_pop_title: 'Рост населения',
    chart_emis_title: 'Выбросы на человека',
    scen_eyebrow: 'Три модели роста',
    scen_title: 'Пути развития до 2045',
    scen_sub: 'Проекции при разной интенсивности устойчивых мер.',
    scen_sprawl_t: 'Расползание',
    scen_sprawl_d: 'Низкая плотность, авто-зависимость. Высокие выбросы, мало зелени.',
    scen_compact_t: 'Компактный',
    scen_compact_d: 'Смешанная застройка, транзит-ориентированность. Средняя устойчивость.',
    scen_regen_t: 'Регенеративный',
    scen_regen_d: 'Полный комплекс: солнце, серая вода, вертикальные фермы, транзит.',
    scen_metric_pop: 'Население',
    scen_metric_energy: 'ВИЭ',
    scen_metric_emis: 'CO₂/чел',
    cta_title: 'Город — живой узел планетарной ОС',
    cta_sub: 'Как регенеративный эко-полис встраивается в дорожную карту и архитектуру ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2027 → 2045',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Regenerative City',
    eyebrow: 'Smart city on restored land',
    hero_title: 'Regenerative City',
    hero_accent: 'An eco-polis on the former Aral seabed',
    hero_lead:
      'Design the districts of a new city directly on restored land. Change density, green ratio and urban interventions — livability and resource metrics recompute in real time.',
    kpi_pop: 'Population capacity',
    kpi_energy: 'Renewable share',
    kpi_water: 'Water recycling',
    kpi_green: 'Green space / capita',
    planner_eyebrow: 'City digital twin',
    planner_title: 'District planner',
    planner_sub:
      'Each cell is a district. Click to cycle its zone: residential → industrial → park → water. Move the density and greening sliders — the livability index responds instantly.',
    slider_density: 'Building density',
    slider_green: 'Green ratio',
    legend_residential: 'Residential',
    legend_industrial: 'Industrial',
    legend_green: 'Parks',
    legend_water: 'Water',
    livability: 'Livability index',
    balance: 'Zone balance',
    zone_tip: 'Click to cycle zone',
    metric_res: 'Resid.',
    metric_ind: 'Indus.',
    metric_grn: 'Parks',
    metric_wtr: 'Water',
    interv_eyebrow: 'Urban interventions',
    interv_title: 'Sustainability scenarios',
    interv_sub:
      'Toggle measures — they raise the renewable share, water recycling and cut per-capita emissions.',
    proj_energy: 'Projected renewables',
    proj_emissions: 'Emissions / capita',
    interv_active: 'measures active',
    charts_eyebrow: 'Dynamics to 2045',
    charts_title: 'City trajectories',
    charts_sub:
      'Population rises while per-capita emissions fall. Curves redraw with density, greening and interventions.',
    chart_pop_title: 'Population growth',
    chart_emis_title: 'Per-capita emissions',
    scen_eyebrow: 'Three growth models',
    scen_title: 'Development paths to 2045',
    scen_sub: 'Projected outcomes under different sustainability intensities.',
    scen_sprawl_t: 'Sprawl',
    scen_sprawl_d: 'Low density, car-dependent. High emissions, little green.',
    scen_compact_t: 'Compact',
    scen_compact_d: 'Mixed-use, transit-oriented. Moderate sustainability.',
    scen_regen_t: 'Regenerative',
    scen_regen_d: 'Full package: solar, greywater, vertical farms, transit.',
    scen_metric_pop: 'Population',
    scen_metric_energy: 'Renewables',
    scen_metric_emis: 'CO₂/cap',
    cta_title: 'The city is a living node of the planetary OS',
    cta_sub: 'How the regenerative eco-polis fits into the roadmap and the ArkheOSium architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2027 → 2045',
  },
  kk: {
    back: 'Жол картасына оралу',
    doc_label: 'Регенеративті қала',
    eyebrow: 'Қалпына келтірілген жердегі ақылды қала',
    hero_title: 'Регенеративті қала',
    hero_accent: 'Бұрынғы Арал түбіндегі эко-полис',
    hero_lead:
      'Жаңа қаланың кварталдарын қалпына келтірілген құрлықта тікелей жобалаңыз. Тығыздықты, көгалдандыру үлесін және қалалық шараларды өзгертіңіз — тұрмысқа жарамдылық пен ресурс көрсеткіштері нақты уақытта қайта есептеледі.',
    kpi_pop: 'Халық сыйымдылығы',
    kpi_energy: 'ЖЭК үлесі',
    kpi_water: 'Су айналымы',
    kpi_green: 'Адам басына көгалдандыру',
    planner_eyebrow: 'Қаланың сандық егізі',
    planner_title: 'Квартал жоспарлаушы',
    planner_sub:
      'Әрбір ұяшық — квартал. Аймақты ауыстыру үшін басыңыз: тұрғын үй → өнеркәсіп → саябақ → су. Тығыздық пен көгалдандыру жүгірткілерін жылжытыңыз — тұрмысқа жарамдылық индексі бірден жауап береді.',
    slider_density: 'Құрылыс тығыздығы',
    slider_green: 'Көгалдандыру үлесі',
    legend_residential: 'Тұрғын үй',
    legend_industrial: 'Өнеркәсіп',
    legend_green: 'Саябақтар',
    legend_water: 'Су',
    livability: 'Тұрмысқа жарамдылық индексі',
    balance: 'Аймақтар балансы',
    zone_tip: 'Басу — аймақты ауыстыру',
    metric_res: 'Тұрғын',
    metric_ind: 'Өнер.',
    metric_grn: 'Саябақ',
    metric_wtr: 'Су',
    interv_eyebrow: 'Қалалық шаралар',
    interv_title: 'Тұрақтылық сценарийлері',
    interv_sub:
      'Шараларды қосыңыз — олар ЖЭК үлесін, су айналымын арттырып, жан басына шаққандағы шығарындыларды азайтады.',
    proj_energy: 'ЖЭК болжамы',
    proj_emissions: 'Шығарынды / адам',
    interv_active: 'шара белсенді',
    charts_eyebrow: '2045 жылға дейінгі динамика',
    charts_title: 'Қала траекториялары',
    charts_sub:
      'Халық өседі, ал жан басына шаққандағы шығарындылар төмендейді. Қисықтар тығыздыққа, көгалдандыруға және шараларға қарай қайта салынады.',
    chart_pop_title: 'Халықтың өсуі',
    chart_emis_title: 'Адам басына шығарынды',
    scen_eyebrow: 'Үш өсу моделі',
    scen_title: '2045 жылға дейінгі даму жолдары',
    scen_sub: 'Тұрақтылық шараларының әртүрлі қарқындылығындағы болжамдар.',
    scen_sprawl_t: 'Жайылу',
    scen_sprawl_d: 'Төмен тығыздық, көлікке тәуелділік. Жоғары шығарынды, аз көгал.',
    scen_compact_t: 'Ықшам',
    scen_compact_d: 'Аралас құрылыс, транзитке бағдарлану. Орташа тұрақтылық.',
    scen_regen_t: 'Регенеративті',
    scen_regen_d: 'Толық кешен: күн, сұр су, тік фермалар, транзит.',
    scen_metric_pop: 'Халық',
    scen_metric_energy: 'ЖЭК',
    scen_metric_emis: 'CO₂/адам',
    cta_title: 'Қала — планетарлық ОЖ-нің тірі торабы',
    cta_sub: 'Регенеративті эко-полис ArkheOSium жол картасы мен архитектурасына қалай кіріктіріледі.',
    cta_roadmap: 'Жол картасы',
    cta_wp: 'Толық whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Деректер көрнекілік үшін.',
    years_note: 'Жылдар: 2027 → 2045',
  },
  uz: {
    back: 'Yo‘l xaritasiga qaytish',
    doc_label: 'Regenerativ shahar',
    eyebrow: 'Tiklangan yerdagi aqlli shahar',
    hero_title: 'Regenerativ shahar',
    hero_accent: 'Sobiq Orol tubidagi eko-polis',
    hero_lead:
      'Yangi shahar kvartallarini tiklangan quruqlikda bevosita loyihalang. Zichlik, ko‘kalamzorlashtirish ulushi va shahar tadbirlarini o‘zgartiring — yashovchanlik va resurs ko‘rsatkichlari real vaqtda qayta hisoblanadi.',
    kpi_pop: 'Aholi sig‘imi',
    kpi_energy: 'QTE ulushi',
    kpi_water: 'Suv aylanishi',
    kpi_green: 'Kishi boshiga ko‘kalamzor',
    planner_eyebrow: 'Shaharning raqamli egizagi',
    planner_title: 'Kvartal rejalashtiruvchi',
    planner_sub:
      'Har bir katak — kvartal. Zonani almashtirish uchun bosing: turar-joy → sanoat → bog‘ → suv. Zichlik va ko‘kalamzorlashtirish slayderlarini suring — yashovchanlik indeksi darhol javob beradi.',
    slider_density: 'Qurilish zichligi',
    slider_green: 'Ko‘kalamzorlashtirish ulushi',
    legend_residential: 'Turar-joy',
    legend_industrial: 'Sanoat',
    legend_green: 'Bog‘lar',
    legend_water: 'Suv',
    livability: 'Yashovchanlik indeksi',
    balance: 'Zonalar balansi',
    zone_tip: 'Bosing — zonani almashtiring',
    metric_res: 'Turar.',
    metric_ind: 'Sanoat',
    metric_grn: 'Bog‘',
    metric_wtr: 'Suv',
    interv_eyebrow: 'Shahar tadbirlari',
    interv_title: 'Barqarorlik ssenariylari',
    interv_sub:
      'Chora-tadbirlarni yoqing — ular QTE ulushi va suv aylanishini oshirib, jon boshiga chiqindilarni kamaytiradi.',
    proj_energy: 'QTE bashorati',
    proj_emissions: 'Chiqindi / kishi',
    interv_active: 'chora faol',
    charts_eyebrow: '2045-yilgacha dinamika',
    charts_title: 'Shahar trayektoriyalari',
    charts_sub:
      'Aholi o‘sadi, jon boshiga chiqindilar esa kamayadi. Egri chiziqlar zichlik, ko‘kalamzorlashtirish va tadbirlarga qarab qayta chiziladi.',
    chart_pop_title: 'Aholining o‘sishi',
    chart_emis_title: 'Kishi boshiga chiqindilar',
    scen_eyebrow: 'Uch o‘sish modeli',
    scen_title: '2045-yilgacha rivojlanish yo‘llari',
    scen_sub: 'Barqarorlik chora-tadbirlarining turli jadalligidagi bashoratlar.',
    scen_sprawl_t: 'Tarqoqlik',
    scen_sprawl_d: 'Past zichlik, avtomobilga bog‘liqlik. Yuqori chiqindi, kam ko‘kalamzor.',
    scen_compact_t: 'Ixcham',
    scen_compact_d: 'Aralash qurilish, tranzitga yo‘naltirilgan. O‘rtacha barqarorlik.',
    scen_regen_t: 'Regenerativ',
    scen_regen_d: 'To‘liq majmua: quyosh, kulrang suv, vertikal fermalar, tranzit.',
    scen_metric_pop: 'Aholi',
    scen_metric_energy: 'QTE',
    scen_metric_emis: 'CO₂/kishi',
    cta_title: 'Shahar — planetar OT ning tirik tuguni',
    cta_sub: 'Regenerativ eko-polis ArkheOSium yo‘l xaritasi va arxitekturasiga qanday integratsiyalashadi.',
    cta_roadmap: 'Yo‘l xaritasi',
    cta_wp: 'To‘liq whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Ma’lumotlar namoyish uchun.',
    years_note: 'Yillar: 2027 → 2045',
  },
  ar: {
    back: 'العودة إلى خارطة الطريق',
    doc_label: 'مدينة تجديدية',
    eyebrow: 'مدينة ذكية على أرض مُستعادة',
    hero_title: 'مدينة تجديدية',
    hero_accent: 'مدينة بيئية على قاع بحر آرال السابق',
    hero_lead:
      'صمّم أحياء مدينة جديدة مباشرة على أرض مُستعادة. غيّر الكثافة ونسبة المساحات الخضراء والتدخلات الحضرية — تُعاد حسابات مؤشرات جودة العيش والموارد في الوقت الفعلي.',
    kpi_pop: 'السعة السكانية',
    kpi_energy: 'حصة الطاقة المتجددة',
    kpi_water: 'إعادة تدوير المياه',
    kpi_green: 'المساحات الخضراء للفرد',
    planner_eyebrow: 'التوأم الرقمي للمدينة',
    planner_title: 'مخطط الأحياء',
    planner_sub:
      'كل خلية حيّ. انقر لتبديل المنطقة: سكني ← صناعي ← حديقة ← مياه. حرّك منزلقات الكثافة والتخضير — يستجيب مؤشر جودة العيش فورًا.',
    slider_density: 'كثافة البناء',
    slider_green: 'نسبة التخضير',
    legend_residential: 'سكني',
    legend_industrial: 'صناعي',
    legend_green: 'حدائق',
    legend_water: 'مياه',
    livability: 'مؤشر جودة العيش',
    balance: 'توازن المناطق',
    zone_tip: 'انقر لتبديل المنطقة',
    metric_res: 'سكني',
    metric_ind: 'صناعي',
    metric_grn: 'حدائق',
    metric_wtr: 'مياه',
    interv_eyebrow: 'التدخلات الحضرية',
    interv_title: 'سيناريوهات الاستدامة',
    interv_sub:
      'فعّل الإجراءات — فهي ترفع حصة الطاقة المتجددة وإعادة تدوير المياه وتخفّض الانبعاثات للفرد.',
    proj_energy: 'توقع الطاقة المتجددة',
    proj_emissions: 'الانبعاثات / فرد',
    interv_active: 'إجراء نشط',
    charts_eyebrow: 'الديناميكيات حتى 2045',
    charts_title: 'مسارات المدينة',
    charts_sub:
      'يرتفع عدد السكان بينما تنخفض الانبعاثات للفرد. تُعاد رسم المنحنيات وفق الكثافة والتخضير والتدخلات.',
    chart_pop_title: 'نمو السكان',
    chart_emis_title: 'الانبعاثات للفرد',
    scen_eyebrow: 'ثلاثة نماذج للنمو',
    scen_title: 'مسارات التطور حتى 2045',
    scen_sub: 'إسقاطات وفق شدّات مختلفة لإجراءات الاستدامة.',
    scen_sprawl_t: 'التمدد',
    scen_sprawl_d: 'كثافة منخفضة واعتماد على السيارات. انبعاثات عالية ومساحات خضراء قليلة.',
    scen_compact_t: 'مدمج',
    scen_compact_d: 'استخدام مختلط وتوجّه نحو النقل العام. استدامة متوسطة.',
    scen_regen_t: 'تجديدي',
    scen_regen_d: 'الحزمة الكاملة: طاقة شمسية، مياه رمادية، مزارع عمودية، نقل عام.',
    scen_metric_pop: 'السكان',
    scen_metric_energy: 'الطاقة المتجددة',
    scen_metric_emis: 'CO₂/فرد',
    cta_title: 'المدينة عقدة حية في نظام تشغيل الكوكب',
    cta_sub: 'كيف تندمج المدينة البيئية التجديدية في خارطة الطريق وبنية ArkheOSium.',
    cta_roadmap: 'خارطة الطريق',
    cta_wp: 'الورقة البيضاء الكاملة',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. البيانات توضيحية.',
    years_note: 'السنوات: 2027 ← 2045',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

interface Intervention {
  id: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label_ru: string;
  label_en: string;
  color: string;
  energy: number;   // renewable share boost (0..1)
  water: number;    // recycling boost (0..1)
  emissions: number; // emissions reduction factor (0..1)
}

interface Scenario {
  key: string;
  color: string;
  pop: string;
  energy: number;
  emis: number;
  spark: number[];
}

// ─── Deterministic pseudo-random (no per-frame arrays) ──────────────────────────

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Interventions ──────────────────────────────────────────────────────────────

const INTERVENTIONS: Intervention[] = [
  { id: 'solar', Icon: Sun, label_ru: 'Солнечные крыши', label_en: 'Solar rooftops', color: '#fbbf24', energy: 0.22, water: 0, emissions: 0.14 },
  { id: 'greywater', Icon: Recycle, label_ru: 'Рециклинг серой воды', label_en: 'Greywater recycling', color: '#06b6d4', energy: 0, water: 0.28, emissions: 0.05 },
  { id: 'vfarm', Icon: Sprout, label_ru: 'Вертикальные фермы', label_en: 'Vertical farms', color: '#22c55e', energy: 0.04, water: 0.08, emissions: 0.1 },
  { id: 'transit', Icon: Train, label_ru: 'Транзит-плотность', label_en: 'Transit-oriented density', color: '#a78bfa', energy: 0.06, water: 0, emissions: 0.18 },
];

// ─── Reusable animated section ──────────────────────────────────────────────────

function Section({
  id, eyebrow, title, subtitle, children,
}: {
  id: string; eyebrow?: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20 border-t border-white/5 first:border-0">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: ACCENT }}>
              {eyebrow}
            </div>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="mt-4 text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}

// ─── KPI tile ───────────────────────────────────────────────────────────────────

function KpiTile({
  Icon, val, label, color, trend,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  val: string; label: string; color: string; trend?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4 }}
      className="bg-[#000d24] border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
          <Icon size={17} />
        </div>
        {trend === 'down' && <TrendingDown size={15} className="text-emerald-400" />}
        {trend === 'up' && <TrendingUp size={15} style={{ color: ACCENT }} />}
      </div>
      <div className="text-2xl font-black font-mono" style={{ color }}>{val}</div>
      <div className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</div>
    </motion.div>
  );
}

// ─── Trend chart (SVG area) ─────────────────────────────────────────────────────

function TrendChart({
  points, color, title, unit, reduce, max,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean; max: number;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const step = (W - PAD * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = PAD + i * step;
    const y = PAD + (1 - p / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${H - PAD} L${coords[0][0].toFixed(1)},${H - PAD} Z`;
  const last = points[points.length - 1];
  const gid = `grad-${title.replace(/\s+/g, '')}`;

  return (
    <div className="bg-[#000d24] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-lg font-black font-mono" style={{ color }}>{Math.round(last)}{unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)}
            stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        ))}
        <motion.path
          d={area}
          fill={`url(#${gid})`}
          initial={false}
          animate={{ d: area }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ d: line }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        />
        <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={color} />
      </svg>
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120;
  const H = 34;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = W / (data.length - 1);
  const d = data
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(H - ((v - min) / range) * H).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════

export default function CityPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [density, setDensity] = useState(55);   // 0..100
  const [greening, setGreening] = useState(35); // 0..100
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Initial district layout (deterministic seed → zone assignment)
  const initialZones = useMemo<Zone[]>(() => {
    return Array.from({ length: CELL_COUNT }, (_, idx) => {
      const col = idx % GRID_COLS;
      const row = Math.floor(idx / GRID_COLS);
      const n = hash(idx);
      // Water rim along one edge (former shoreline), parks scattered, rest residential/industrial.
      if (row >= GRID_ROWS - 1 && n < 0.7) return 'water';
      if (n < 0.16) return 'green';
      if (n > 0.86 && col > GRID_COLS / 2) return 'industrial';
      return 'residential';
    });
  }, []);

  const [zones, setZones] = useState<Zone[]>(initialZones);

  function cycleZone(idx: number) {
    setZones((prev) => {
      const next = prev.slice();
      const cur = ZONE_CYCLE.indexOf(next[idx]);
      next[idx] = ZONE_CYCLE[(cur + 1) % ZONE_CYCLE.length];
      return next;
    });
  }

  // Zone counts
  const counts = useMemo(() => {
    const c: Record<Zone, number> = { residential: 0, industrial: 0, green: 0, water: 0 };
    zones.forEach((z) => { c[z] += 1; });
    return c;
  }, [zones]);

  const resShare = counts.residential / CELL_COUNT;
  const grnShare = (counts.green + counts.water) / CELL_COUNT;
  const indShare = counts.industrial / CELL_COUNT;

  // Intervention boosts
  const energyBoost = useMemo(
    () => INTERVENTIONS.reduce((a, it) => a + (active[it.id] ? it.energy : 0), 0),
    [active],
  );
  const waterBoost = useMemo(
    () => INTERVENTIONS.reduce((a, it) => a + (active[it.id] ? it.water : 0), 0),
    [active],
  );
  const emissionsCut = useMemo(
    () => INTERVENTIONS.reduce((a, it) => a + (active[it.id] ? it.emissions : 0), 0),
    [active],
  );
  const activeCount = INTERVENTIONS.filter((it) => active[it.id]).length;

  // ── Derived KPIs ─────────────────────────────────────────────────────────────
  const g = greening / 100;
  const d = density / 100;

  // Population capacity grows with density & residential zoning
  const popCapacity = Math.round((0.4 + d * 0.9) * (0.5 + resShare) * 480_000);
  const kpiPop = popCapacity >= 1_000_000
    ? `${(popCapacity / 1_000_000).toFixed(2)}M`
    : `${Math.round(popCapacity / 1000)}K`;

  // Renewable share (baseline + greening + interventions)
  const renewable = Math.min(98, Math.round(28 + g * 22 + energyBoost * 100 + grnShare * 20));
  // Water recycling
  const waterRecycle = Math.min(98, Math.round(34 + waterBoost * 100 + grnShare * 24));
  // Green space per capita (m²) — rises with greening, falls with density
  const greenPerCap = Math.max(2, (6 + g * 34) * (1.3 - d * 0.6)).toFixed(1);

  // Livability index (0..100): balance of green, moderate density, low industrial dominance
  const densityPenalty = Math.max(0, d - 0.75) * 60; // overcrowding
  const livability = Math.round(
    Math.max(0, Math.min(100,
      40 + grnShare * 60 + renewable * 0.14 + waterRecycle * 0.1 - indShare * 45 - densityPenalty,
    )),
  );

  // Per-capita emissions (tonnes CO₂) — falls with renewables, transit, greening
  const emissions = Math.max(0.4, (5.2 - renewable * 0.028 - g * 0.9 - emissionsCut * 3.4)).toFixed(1);

  // ── Trend series (redraw with state). 8 steps 2027→2045 ──────────────────────
  const YEARS = 8;
  const popSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      // grows toward capacity; density accelerates early growth
      const target = 100;
      return 22 + (target - 22) * (0.3 + d * 0.7) * t;
    }),
    [d],
  );
  const emisSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      const start = 88;
      const reduction = (renewable / 100) * 0.5 + g * 0.25 + emissionsCut * 0.5;
      return start - start * reduction * t;
    }),
    [renewable, g, emissionsCut],
  );

  const scenarios: Scenario[] = [
    {
      key: 'sprawl', color: '#f87171', pop: '320K', energy: 24, emis: 4.9,
      spark: [88, 86, 85, 84, 83, 82, 81, 80],
    },
    {
      key: 'compact', color: '#fbbf24', pop: '740K', energy: 52, emis: 2.6,
      spark: [88, 78, 68, 60, 52, 46, 41, 37],
    },
    {
      key: 'regen', color: '#22c55e', pop: '1.1M', energy: 84, emis: 0.9,
      spark: [88, 70, 55, 42, 32, 24, 17, 12],
    },
  ];

  const scenText: Record<string, { t: string; d: string }> = {
    sprawl: { t: s.scen_sprawl_t, d: s.scen_sprawl_d },
    compact: { t: s.scen_compact_t, d: s.scen_compact_d },
    regen: { t: s.scen_regen_t, d: s.scen_regen_d },
  };

  const zoneLegend: { z: Zone; label: string }[] = [
    { z: 'residential', label: s.legend_residential },
    { z: 'industrial', label: s.legend_industrial },
    { z: 'green', label: s.legend_green },
    { z: 'water', label: s.legend_water },
  ];

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#38bdf8]/70 hover:text-[#38bdf8] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Building2 size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2e]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#38bdf8]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#a78bfa]/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-xs text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <Building2 size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#38bdf8] via-[#06b6d4] to-[#a78bfa] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Users} val={kpiPop} label={s.kpi_pop} color={ACCENT} trend="up" />
              <KpiTile Icon={Sun} val={`${renewable}%`} label={s.kpi_energy} color="#fbbf24" trend="up" />
              <KpiTile Icon={Droplets} val={`${waterRecycle}%`} label={s.kpi_water} color="#06b6d4" trend="up" />
              <KpiTile Icon={Trees} val={`${greenPerCap}`} label={s.kpi_green} color="#22c55e" trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ DISTRICT PLANNER (centerpiece) ══ */}
      <Section id="planner" eyebrow={s.planner_eyebrow} title={s.planner_title} subtitle={s.planner_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Sliders */}
          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                  {s.slider_density}
                </label>
                <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{density}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="w-full accent-[#38bdf8] cursor-pointer"
                aria-label={s.slider_density}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#22c55e' }}>
                  {s.slider_green}
                </label>
                <span className="font-mono text-sm font-bold" style={{ color: '#22c55e' }}>{greening}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={greening}
                onChange={(e) => setGreening(Number(e.target.value))}
                className="w-full accent-[#22c55e] cursor-pointer"
                aria-label={s.slider_green}
              />
            </div>
          </div>

          {/* District grid */}
          <div
            className="grid gap-[4px] rounded-xl overflow-hidden mb-4"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
          >
            {zones.map((z, idx) => {
              const base = ZONE_COLORS[z];
              // green/water tiles get greening-linked opacity; residential darkens with density
              const op = z === 'green' || z === 'water'
                ? 0.55 + g * 0.4
                : z === 'residential'
                  ? 0.45 + d * 0.45
                  : 0.7;
              return (
                <button
                  key={idx}
                  onClick={() => cycleZone(idx)}
                  title={s.zone_tip}
                  className="aspect-square rounded-[4px] cursor-pointer hover:ring-2 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                  style={{
                    backgroundColor: base,
                    opacity: op,
                    transition: reduce ? 'none' : 'background-color 0.4s ease, opacity 0.4s ease',
                  }}
                  aria-label={z}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 flex-wrap text-[11px] text-gray-400 mb-6">
            {zoneLegend.map(({ z, label }) => (
              <span key={z} className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: ZONE_COLORS[z] }} /> {label}
              </span>
            ))}
          </div>

          {/* Live readouts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
              <div className="text-[11px] text-gray-500 mb-1">{s.livability}</div>
              <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{livability}</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: ACCENT }}
                  animate={{ width: `${livability}%` }}
                  transition={reduce ? { duration: 0 } : { duration: 0.4 }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
              <div className="text-[11px] text-gray-500 mb-1">{s.metric_res} / {s.metric_ind}</div>
              <div className="text-2xl font-black font-mono" style={{ color: ZONE_COLORS.residential }}>
                {counts.residential}<span className="text-gray-600 text-base">/</span>
                <span style={{ color: ZONE_COLORS.industrial }}>{counts.industrial}</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
              <div className="text-[11px] text-gray-500 mb-1">{s.metric_grn} / {s.metric_wtr}</div>
              <div className="text-2xl font-black font-mono" style={{ color: ZONE_COLORS.green }}>
                {counts.green}<span className="text-gray-600 text-base">/</span>
                <span style={{ color: ZONE_COLORS.water }}>{counts.water}</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
              <div className="text-[11px] text-gray-500 mb-1">{s.balance}</div>
              <div className="mt-2 flex h-4 rounded-md overflow-hidden">
                <span style={{ width: `${resShare * 100}%`, background: ZONE_COLORS.residential }} />
                <span style={{ width: `${indShare * 100}%`, background: ZONE_COLORS.industrial }} />
                <span style={{ width: `${(counts.green / CELL_COUNT) * 100}%`, background: ZONE_COLORS.green }} />
                <span style={{ width: `${(counts.water / CELL_COUNT) * 100}%`, background: ZONE_COLORS.water }} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ══ INTERVENTIONS ══ */}
      <Section id="interventions" eyebrow={s.interv_eyebrow} title={s.interv_title} subtitle={s.interv_sub}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {INTERVENTIONS.map((it) => {
            const on = !!active[it.id];
            return (
              <button
                key={it.id}
                onClick={() => setActive((p) => ({ ...p, [it.id]: !p[it.id] }))}
                className="text-left rounded-2xl border p-4 transition-all"
                style={{
                  borderColor: on ? it.color + '80' : 'rgba(255,255,255,0.1)',
                  background: on ? `linear-gradient(135deg, ${it.color}18, transparent)` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: it.color + '1f', color: it.color }}>
                    <it.Icon size={18} />
                  </div>
                  <span
                    className="w-9 h-5 rounded-full flex items-center transition-all px-0.5"
                    style={{ background: on ? it.color : 'rgba(255,255,255,0.12)', justifyContent: on ? 'flex-end' : 'flex-start' }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white block" />
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">{lang === 'en' ? it.label_en : it.label_ru}</div>
                <div className="text-[11px] font-mono mt-1 flex gap-2" style={{ color: it.color }}>
                  {it.energy > 0 && <span>+{Math.round(it.energy * 100)}% ⚡</span>}
                  {it.water > 0 && <span>+{Math.round(it.water * 100)}% 💧</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_energy}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#fbbf24' }}>{renewable}%</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_emissions}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#22c55e' }}>{emissions} t</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.interv_active}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{activeCount}/{INTERVENTIONS.length}</div>
          </div>
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.charts_eyebrow} title={s.charts_title} subtitle={s.charts_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={popSeries} color={ACCENT} title={s.chart_pop_title} unit="%" reduce={reduce} max={100} />
          <TrendChart points={emisSeries} color="#22c55e" title={s.chart_emis_title} unit="" reduce={reduce} max={100} />
        </div>
        <div className="text-[11px] text-gray-600 mt-3 text-center">{s.years_note}</div>
      </Section>

      {/* ══ SCENARIO CARDS ══ */}
      <Section id="scenarios" eyebrow={s.scen_eyebrow} title={s.scen_title} subtitle={s.scen_sub}>
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <motion.div
              key={sc.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: sc.color + '30', background: `linear-gradient(135deg, ${sc.color}0a, transparent)` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: sc.color }} />
                <h3 className="text-white font-bold">{scenText[sc.key].t}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 min-h-[48px]">{scenText[sc.key].d}</p>

              <div className="mb-4">
                <Sparkline data={sc.spark} color={sc.color} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.pop}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_pop}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.energy}%</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_energy}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.emis}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_emis}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ CTA ══ */}
      <section id="cta" className="scroll-mt-24 py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[#38bdf8]/20 p-8 text-center bg-gradient-to-b from-[#38bdf8]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#38bdf8]/10 text-[#38bdf8]">
              <Building2 size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] hover:bg-[#38bdf8]/20 transition-colors text-sm font-medium"
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20 transition-colors text-sm font-medium"
                style={{ borderColor: ACCENT2 + '4d' }}
              >
                <FileText size={14} /> {s.cta_wp}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-8">{s.copyright}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
