import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Recycle, Droplets, Factory, Sprout, Leaf,
  TrendingDown, TrendingUp, FileText, Compass, Gauge, RefreshCw, Trash2,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
//  ArkheOSium — Circular Economy (closed-loop resource flows)
//  Route: /circular
// ══════════════════════════════════════════════════════════════════════════════

const ACCENT = '#2dd4bf';
const ACCENT2 = '#facc15';

// ─── i18n (self-contained, bilingual) ───────────────────────────────────────────

const STRINGS = {
  ru: {
    back: 'Назад к дорожной карте',
    doc_label: 'Циркулярная экономика',
    eyebrow: 'Замкнутые циклы',
    hero_title: 'Циркулярная экономика',
    hero_accent: 'Замкнутые потоки воды, материалов и питательных веществ',
    hero_lead:
      'Проектирование безотходных циклов Приаралья: вода, материалы, отходы и биогенные вещества возвращаются в оборот. Двигайте ползунки восстановления — петля оживает, индекс цикличности пересчитывается.',
    kpi_recovery: 'Возврат материалов',
    kpi_reuse: 'Повторное исп. воды',
    kpi_diverted: 'Отходы от полигонов',
    kpi_co2: 'Избегнуто CO₂, кт',
    loop_eyebrow: 'Цифровой двойник цикла',
    loop_title: 'Замкнутая петля ресурсов',
    loop_sub:
      'Вход → использование → восстановление → повторное использование. Двигайте ползунки переработки и реюза воды — поток замыкается, а «утечка» в отходы сокращается.',
    slider_recycle: 'Переработка материалов',
    slider_water: 'Реюз воды',
    ci_label: 'Индекс цикличности',
    node_input: 'Первичный вход',
    node_use: 'Использование',
    node_recover: 'Восстановление',
    node_reuse: 'Повторный оборот',
    node_leak: 'Потери / полигон',
    flow_recovered: 'Возвращено в цикл',
    flow_leaked: 'Утечка из цикла',
    interv_eyebrow: 'Сценарное моделирование',
    interv_title: 'Циркулярные вмешательства',
    interv_sub:
      'Включайте инфраструктуру замкнутого цикла — она поднимает индекс цикличности, снижает первичное потребление и увеличивает возвращённую ценность.',
    proj_ci: 'Прогнозный индекс',
    proj_virgin: 'Первичное сырьё',
    interv_active: 'мер активно',
    charts_eyebrow: 'Динамика',
    charts_title: 'Тренды замыкания цикла',
    charts_sub:
      'Потребление первичного сырья снижается, ценность восстановленных ресурсов растёт. Кривые перестраиваются вслед за ползунками и вмешательствами.',
    chart_virgin_title: 'Первичное сырьё',
    chart_value_title: 'Ценность восстановленного',
    scen_eyebrow: 'Сценарии до 2040',
    scen_title: 'Три пути к замкнутому циклу',
    scen_sub: 'Проекции исхода при разной глубине циркулярной трансформации.',
    scen_linear_t: 'Линейный',
    scen_linear_d: 'Взять–произвести–выбросить. Отходы растут, ресурсы истощаются.',
    scen_hybrid_t: 'Гибридный',
    scen_hybrid_d: 'Частичная переработка и реюз воды. Умеренное замыкание потоков.',
    scen_circular_t: 'Циркулярный',
    scen_circular_d: 'Полный цикл: МПЗ, водооборот, биогаз, промышленный симбиоз.',
    scen_metric_ci: 'Индекс к 2040',
    scen_metric_virgin: 'Первичное сырьё',
    scen_metric_waste: 'Отходы',
    cta_title: 'Циркулярная экономика — ядро планетарной ОС',
    cta_sub: 'Как замкнутые циклы ресурсов встраиваются в дорожную карту и архитектуру платформы ArkheOSium.',
    cta_roadmap: 'Дорожная карта',
    cta_wp: 'Полный whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Данные демонстрационные.',
    years_note: 'Годы: 2026 → 2040',
  },
  en: {
    back: 'Back to roadmap',
    doc_label: 'Circular Economy',
    eyebrow: 'Closed loops',
    hero_title: 'Circular Economy',
    hero_accent: 'Closed-loop flows of water, materials & nutrients',
    hero_lead:
      'Designing zero-waste loops for the Aral region: water, materials, waste and nutrients returning to circulation. Move the recovery sliders — the loop comes alive and the circularity index recomputes.',
    kpi_recovery: 'Material recovery',
    kpi_reuse: 'Water reuse',
    kpi_diverted: 'Waste diverted',
    kpi_co2: 'CO₂ avoided, kt',
    loop_eyebrow: 'Loop digital twin',
    loop_title: 'Closed resource loop',
    loop_sub:
      'Input → use → recover → reuse. Drag the recycling and water-reuse sliders — the flow closes and the leak into waste shrinks.',
    slider_recycle: 'Material recycling',
    slider_water: 'Water reuse',
    ci_label: 'Circularity index',
    node_input: 'Virgin input',
    node_use: 'Use phase',
    node_recover: 'Recovery',
    node_reuse: 'Reuse loop',
    node_leak: 'Leakage / landfill',
    flow_recovered: 'Returned to loop',
    flow_leaked: 'Leaked from loop',
    interv_eyebrow: 'Scenario modelling',
    interv_title: 'Circular interventions',
    interv_sub:
      'Toggle closed-loop infrastructure — it raises the circularity index, cuts virgin consumption and grows recovered value.',
    proj_ci: 'Projected index',
    proj_virgin: 'Virgin material',
    interv_active: 'measures active',
    charts_eyebrow: 'Dynamics',
    charts_title: 'Loop-closing trends',
    charts_sub:
      'Virgin-material use declines while the value of recovered resources rises. Curves redraw with the sliders and interventions.',
    chart_virgin_title: 'Virgin material use',
    chart_value_title: 'Recovered-resource value',
    scen_eyebrow: 'Scenarios to 2040',
    scen_title: 'Three paths to a closed loop',
    scen_sub: 'Projected outcomes under different depths of circular transformation.',
    scen_linear_t: 'Linear',
    scen_linear_d: 'Take–make–dispose. Waste grows, resources deplete.',
    scen_hybrid_t: 'Hybrid',
    scen_hybrid_d: 'Partial recycling and water reuse. Moderate loop-closing.',
    scen_circular_t: 'Circular',
    scen_circular_d: 'Full loop: MRF, water reclamation, biogas, industrial symbiosis.',
    scen_metric_ci: 'Index by 2040',
    scen_metric_virgin: 'Virgin material',
    scen_metric_waste: 'Waste',
    cta_title: 'The circular economy is the core of the planetary OS',
    cta_sub: 'How closed resource loops fit into the roadmap and the ArkheOSium platform architecture.',
    cta_roadmap: 'Roadmap',
    cta_wp: 'Full whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Data is illustrative.',
    years_note: 'Years: 2026 → 2040',
  },
  kk: {
    back: 'Жол картасына оралу',
    doc_label: 'Циркулярлық экономика',
    eyebrow: 'Тұйық циклдер',
    hero_title: 'Циркулярлық экономика',
    hero_accent: 'Су, материалдар және қоректік заттардың тұйық ағындары',
    hero_lead:
      'Арал өңірінің қалдықсыз циклдерін жобалау: су, материалдар, қалдықтар мен биогенді заттар айналымға қайта оралады. Қалпына келтіру жүгірткілерін жылжытыңыз — цикл жанданады, циклдік индексі қайта есептеледі.',
    kpi_recovery: 'Материалдарды қайтару',
    kpi_reuse: 'Суды қайта пайдалану',
    kpi_diverted: 'Полигоннан бұрылған қалдықтар',
    kpi_co2: 'Болдырылмаған CO₂, кт',
    loop_eyebrow: 'Циклдің цифрлық егізі',
    loop_title: 'Ресурстардың тұйық циклі',
    loop_sub:
      'Кіріс → пайдалану → қалпына келтіру → қайта пайдалану. Қайта өңдеу мен суды қайта пайдалану жүгірткілерін жылжытыңыз — ағын тұйықталады, ал қалдыққа «ағып кету» азаяды.',
    slider_recycle: 'Материалдарды қайта өңдеу',
    slider_water: 'Суды қайта пайдалану',
    ci_label: 'Циклдік индексі',
    node_input: 'Бастапқы кіріс',
    node_use: 'Пайдалану',
    node_recover: 'Қалпына келтіру',
    node_reuse: 'Қайта айналым',
    node_leak: 'Шығындар / полигон',
    flow_recovered: 'Циклге қайтарылды',
    flow_leaked: 'Циклден ағып кетті',
    interv_eyebrow: 'Сценарийлік модельдеу',
    interv_title: 'Циркулярлық шаралар',
    interv_sub:
      'Тұйық цикл инфрақұрылымын қосыңыз — ол циклдік индексін көтереді, бастапқы тұтынуды азайтады және қайтарылған құндылықты арттырады.',
    proj_ci: 'Болжамды индекс',
    proj_virgin: 'Бастапқы шикізат',
    interv_active: 'шара белсенді',
    charts_eyebrow: 'Динамика',
    charts_title: 'Циклді тұйықтау трендтері',
    charts_sub:
      'Бастапқы шикізатты тұтыну азаяды, қалпына келтірілген ресурстардың құндылығы өседі. Қисықтар жүгірткілер мен шараларға сәйкес қайта салынады.',
    chart_virgin_title: 'Бастапқы шикізат',
    chart_value_title: 'Қалпына келтірілгеннің құндылығы',
    scen_eyebrow: '2040 жылға дейінгі сценарийлер',
    scen_title: 'Тұйық циклге үш жол',
    scen_sub: 'Циркулярлық трансформацияның әртүрлі тереңдігіндегі нәтиже болжамдары.',
    scen_linear_t: 'Сызықтық',
    scen_linear_d: 'Алу–өндіру–тастау. Қалдықтар өседі, ресурстар сарқылады.',
    scen_hybrid_t: 'Гибридті',
    scen_hybrid_d: 'Ішінара қайта өңдеу және суды қайта пайдалану. Ағындарды орташа тұйықтау.',
    scen_circular_t: 'Циркулярлық',
    scen_circular_d: 'Толық цикл: МҚЗ, су айналымы, биогаз, өнеркәсіптік симбиоз.',
    scen_metric_ci: '2040 жылға индекс',
    scen_metric_virgin: 'Бастапқы шикізат',
    scen_metric_waste: 'Қалдықтар',
    cta_title: 'Циркулярлық экономика — планеталық ОЖ өзегі',
    cta_sub: 'Ресурстардың тұйық циклдері ArkheOSium платформасының жол картасы мен архитектурасына қалай кіріктірілген.',
    cta_roadmap: 'Жол картасы',
    cta_wp: 'Толық whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Деректер көрнекілік үшін.',
    years_note: 'Жылдар: 2026 → 2040',
  },
  uz: {
    back: 'Yo‘l xaritasiga qaytish',
    doc_label: 'Sirkulyar iqtisodiyot',
    eyebrow: 'Yopiq sikllar',
    hero_title: 'Sirkulyar iqtisodiyot',
    hero_accent: 'Suv, materiallar va oziq moddalarning yopiq oqimlari',
    hero_lead:
      'Orol bo‘yi uchun chiqindisiz sikllarni loyihalash: suv, materiallar, chiqindilar va biogen moddalar aylanmaga qaytadi. Tiklash slayderlarini suring — sikl jonlanadi, sirkulyarlik indeksi qayta hisoblanadi.',
    kpi_recovery: 'Materiallarni qaytarish',
    kpi_reuse: 'Suvni qayta ishlatish',
    kpi_diverted: 'Poligondan chetlangan chiqindilar',
    kpi_co2: 'Oldi olingan CO₂, kt',
    loop_eyebrow: 'Sikl raqamli egizagi',
    loop_title: 'Resurslarning yopiq sikli',
    loop_sub:
      'Kirish → foydalanish → tiklash → qayta ishlatish. Qayta ishlash va suvni qayta ishlatish slayderlarini suring — oqim yopiladi, chiqindiga «sizib chiqish» kamayadi.',
    slider_recycle: 'Materiallarni qayta ishlash',
    slider_water: 'Suvni qayta ishlatish',
    ci_label: 'Sirkulyarlik indeksi',
    node_input: 'Birlamchi kirish',
    node_use: 'Foydalanish',
    node_recover: 'Tiklash',
    node_reuse: 'Qayta aylanish',
    node_leak: 'Yo‘qotishlar / poligon',
    flow_recovered: 'Siklga qaytarildi',
    flow_leaked: 'Sikldan sizib chiqdi',
    interv_eyebrow: 'Ssenariy modellashtirish',
    interv_title: 'Sirkulyar chora-tadbirlar',
    interv_sub:
      'Yopiq sikl infratuzilmasini yoqing — u sirkulyarlik indeksini oshiradi, birlamchi iste’molni kamaytiradi va qaytarilgan qiymatni oshiradi.',
    proj_ci: 'Bashoratli indeks',
    proj_virgin: 'Birlamchi xomashyo',
    interv_active: 'chora faol',
    charts_eyebrow: 'Dinamika',
    charts_title: 'Siklni yopish tendensiyalari',
    charts_sub:
      'Birlamchi xomashyo iste’moli pasayadi, tiklangan resurslar qiymati oshadi. Egri chiziqlar slayderlar va chora-tadbirlarga mos ravishda qayta chiziladi.',
    chart_virgin_title: 'Birlamchi xomashyo',
    chart_value_title: 'Tiklangan resurs qiymati',
    scen_eyebrow: '2040 yilgacha ssenariylar',
    scen_title: 'Yopiq siklga uch yo‘l',
    scen_sub: 'Sirkulyar transformatsiyaning turli chuqurligidagi natija bashoratlari.',
    scen_linear_t: 'Chiziqli',
    scen_linear_d: 'Olish–ishlab chiqarish–tashlash. Chiqindilar ortadi, resurslar tugaydi.',
    scen_hybrid_t: 'Gibrid',
    scen_hybrid_d: 'Qisman qayta ishlash va suvni qayta ishlatish. Oqimlarni mo‘tadil yopish.',
    scen_circular_t: 'Sirkulyar',
    scen_circular_d: 'To‘liq sikl: MQI, suv aylanmasi, biogaz, sanoat simbiozi.',
    scen_metric_ci: '2040 yilga indeks',
    scen_metric_virgin: 'Birlamchi xomashyo',
    scen_metric_waste: 'Chiqindilar',
    cta_title: 'Sirkulyar iqtisodiyot — planetar OT o‘zagi',
    cta_sub: 'Resurslarning yopiq sikllari ArkheOSium platformasi yo‘l xaritasi va arxitekturasiga qanday integratsiyalashgani.',
    cta_roadmap: 'Yo‘l xaritasi',
    cta_wp: 'To‘liq whitepaper',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. Ma’lumotlar namoyish uchun.',
    years_note: 'Yillar: 2026 → 2040',
  },
  ar: {
    back: 'العودة إلى خارطة الطريق',
    doc_label: 'الاقتصاد الدائري',
    eyebrow: 'حلقات مغلقة',
    hero_title: 'الاقتصاد الدائري',
    hero_accent: 'تدفقات مغلقة للمياه والمواد والمغذيات',
    hero_lead:
      'تصميم حلقات خالية من النفايات لمنطقة بحر آرال: المياه والمواد والنفايات والمغذيات تعود إلى التداول. حرّك أشرطة الاسترداد — تنبض الحلقة بالحياة ويُعاد حساب مؤشر الدائرية.',
    kpi_recovery: 'استرداد المواد',
    kpi_reuse: 'إعادة استخدام المياه',
    kpi_diverted: 'النفايات المحولة عن المكب',
    kpi_co2: 'CO₂ المتجنّب، كيلوطن',
    loop_eyebrow: 'التوأم الرقمي للحلقة',
    loop_title: 'حلقة الموارد المغلقة',
    loop_sub:
      'إدخال ← استخدام ← استرداد ← إعادة استخدام. حرّك شريطي إعادة التدوير وإعادة استخدام المياه — يُغلق التدفق ويتقلص التسرب نحو النفايات.',
    slider_recycle: 'إعادة تدوير المواد',
    slider_water: 'إعادة استخدام المياه',
    ci_label: 'مؤشر الدائرية',
    node_input: 'المدخل الأولي',
    node_use: 'الاستخدام',
    node_recover: 'الاسترداد',
    node_reuse: 'إعادة التداول',
    node_leak: 'الخسائر / المكب',
    flow_recovered: 'أُعيد إلى الحلقة',
    flow_leaked: 'تسرّب من الحلقة',
    interv_eyebrow: 'النمذجة السيناريوهية',
    interv_title: 'التدخلات الدائرية',
    interv_sub:
      'فعّل بنية الحلقة المغلقة — فهي ترفع مؤشر الدائرية وتخفض الاستهلاك الأولي وتزيد القيمة المستردة.',
    proj_ci: 'المؤشر المتوقع',
    proj_virgin: 'المواد الأولية',
    interv_active: 'تدابير مفعّلة',
    charts_eyebrow: 'الديناميكيات',
    charts_title: 'اتجاهات إغلاق الحلقة',
    charts_sub:
      'ينخفض استهلاك المواد الأولية بينما ترتفع قيمة الموارد المستردة. تُعاد رسم المنحنيات وفق الأشرطة والتدخلات.',
    chart_virgin_title: 'استهلاك المواد الأولية',
    chart_value_title: 'قيمة الموارد المستردة',
    scen_eyebrow: 'سيناريوهات حتى 2040',
    scen_title: 'ثلاثة مسارات نحو حلقة مغلقة',
    scen_sub: 'النتائج المتوقعة وفق درجات مختلفة من التحول الدائري.',
    scen_linear_t: 'خطي',
    scen_linear_d: 'أخذ–تصنيع–تخلّص. تنمو النفايات وتنضب الموارد.',
    scen_hybrid_t: 'هجين',
    scen_hybrid_d: 'إعادة تدوير جزئية وإعادة استخدام للمياه. إغلاق معتدل للتدفقات.',
    scen_circular_t: 'دائري',
    scen_circular_d: 'حلقة كاملة: منشأة استرداد المواد، تدوير المياه، الغاز الحيوي، التكافل الصناعي.',
    scen_metric_ci: 'المؤشر بحلول 2040',
    scen_metric_virgin: 'المواد الأولية',
    scen_metric_waste: 'النفايات',
    cta_title: 'الاقتصاد الدائري هو نواة نظام التشغيل الكوكبي',
    cta_sub: 'كيف تندمج حلقات الموارد المغلقة في خارطة الطريق وبنية منصة ArkheOSium.',
    cta_roadmap: 'خارطة الطريق',
    cta_wp: 'الورقة البيضاء الكاملة',
    copyright: '© ArkheOSium — Planetary Infrastructure OS. البيانات توضيحية.',
    years_note: 'السنوات: 2026 ← 2040',
  },
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────────

interface Intervention {
  id: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label_ru: string;
  label_en: string;
  color: string;
  ciBoost: number;    // circularity-index boost (0..1)
  virginCut: number;  // extra virgin-material reduction (0..1)
}

interface Scenario {
  key: string;
  color: string;
  ci: number;
  virgin: number;
  waste: number;
  spark: number[];
}

// ─── Interventions ──────────────────────────────────────────────────────────────

const INTERVENTIONS: Intervention[] = [
  { id: 'mrf', Icon: Recycle, label_ru: 'Материало-перерабат. завод', label_en: 'Material recovery facility', color: '#2dd4bf', ciBoost: 0.12, virginCut: 0.14 },
  { id: 'water', Icon: Droplets, label_ru: 'Водооборотный узел', label_en: 'Water reclamation', color: '#38bdf8', ciBoost: 0.1, virginCut: 0.08 },
  { id: 'biogas', Icon: Sprout, label_ru: 'Компост / биогаз', label_en: 'Composting / biogas', color: '#84cc16', ciBoost: 0.08, virginCut: 0.06 },
  { id: 'symbiosis', Icon: Factory, label_ru: 'Промышленный симбиоз', label_en: 'Industrial symbiosis', color: '#facc15', ciBoost: 0.11, virginCut: 0.12 },
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
  points, color, title, unit, reduce,
}: {
  points: number[]; color: string; title: string; unit: string; reduce: boolean;
}) {
  const W = 480;
  const H = 160;
  const PAD = 8;
  const max = 100;
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

// ─── Loop node coordinates (circular arrangement, viewBox 0 0 480 300) ──────────

interface LoopNode {
  key: 'input' | 'use' | 'recover' | 'reuse';
  x: number;
  y: number;
  color: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

const LOOP_NODES: LoopNode[] = [
  { key: 'input', x: 240, y: 52, color: '#f59e0b', Icon: Factory },
  { key: 'use', x: 400, y: 150, color: '#38bdf8', Icon: RefreshCw },
  { key: 'recover', x: 240, y: 248, color: '#84cc16', Icon: Recycle },
  { key: 'reuse', x: 80, y: 150, color: ACCENT, Icon: Leaf },
];

// ══════════════════════════════════════════════════════════════════════════════

export default function CircularPage() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const lang = (i18n.language || 'ru').slice(0, 2);
  const s = (STRINGS as Record<string, typeof STRINGS.ru>)[lang] ?? STRINGS.ru;

  const [recycle, setRecycle] = useState(45); // material recycling 0..100
  const [waterReuse, setWaterReuse] = useState(35); // water reuse 0..100
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Intervention aggregates
  const ciBoostSum = useMemo(
    () => INTERVENTIONS.reduce((acc, it) => acc + (active[it.id] ? it.ciBoost : 0), 0),
    [active],
  );
  const virginCutSum = useMemo(
    () => INTERVENTIONS.reduce((acc, it) => acc + (active[it.id] ? it.virginCut : 0), 0),
    [active],
  );
  const activeCount = INTERVENTIONS.filter((it) => active[it.id]).length;

  // ─── Core circularity model ───────────────────────────────────────────────
  // Circularity index blends material recycling, water reuse and interventions.
  const circularity = Math.min(
    1,
    (recycle / 100) * 0.45 + (waterReuse / 100) * 0.3 + ciBoostSum,
  );
  const ciPct = Math.round(circularity * 100);

  // Derived KPIs
  const recoveryRate = Math.round(38 + (recycle / 100) * 54 + ciBoostSum * 20); // %
  const reusePct = Math.round(30 + (waterReuse / 100) * 60 + ciBoostSum * 10); // %
  const diverted = Math.round(40 + circularity * 55); // waste diverted %
  const co2Avoided = Math.round(120 + circularity * 640); // kt

  // Virgin material demand (falls with circularity + interventions)
  const virginPct = Math.max(8, Math.round(100 - circularity * 58 - virginCutSum * 40));

  // Loop split: fraction recovered vs leaked
  const recoveredFrac = circularity;
  const leakedFrac = 1 - circularity;

  // ─── Trend series (redraw with model). 8 year steps 2026→2040. ────────────
  const YEARS = 8;
  const virginSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 100 - (circularity * 58 + virginCutSum * 40) * t;
    }),
    [circularity, virginCutSum],
  );
  const valueSeries = useMemo(
    () => Array.from({ length: YEARS }, (_, i) => {
      const t = i / (YEARS - 1);
      return 12 + (circularity * 72 + ciBoostSum * 16) * t;
    }),
    [circularity, ciBoostSum],
  );

  // ─── Scenario cards (static projections) ──────────────────────────────────
  const scenarios: Scenario[] = [
    {
      key: 'linear', color: '#f87171', ci: 18, virgin: 92, waste: 78,
      spark: [96, 95, 94, 93, 93, 92, 92, 92],
    },
    {
      key: 'hybrid', color: '#facc15', ci: 52, virgin: 58, waste: 41,
      spark: [96, 88, 80, 73, 68, 63, 60, 58],
    },
    {
      key: 'circular', color: '#2dd4bf', ci: 86, virgin: 22, waste: 12,
      spark: [96, 82, 68, 55, 44, 35, 27, 22],
    },
  ];

  const scenText: Record<string, { t: string; d: string }> = {
    linear: { t: s.scen_linear_t, d: s.scen_linear_d },
    hybrid: { t: s.scen_hybrid_t, d: s.scen_hybrid_d },
    circular: { t: s.scen_circular_t, d: s.scen_circular_d },
  };

  const nodeLabel: Record<LoopNode['key'], string> = {
    input: s.node_input,
    use: s.node_use,
    recover: s.node_recover,
    reuse: s.node_reuse,
  };

  return (
    <div className="min-h-screen text-gray-200">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-[#000818]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/roadmap')}
          className="flex items-center gap-2 text-sm text-[#2dd4bf]/70 hover:text-[#2dd4bf] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> {s.back}
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <Recycle size={14} />
          <span className="hidden sm:inline">{s.doc_label}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/whitepaper-full')}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#2dd4bf]/30 text-[#2dd4bf] hover:bg-[#2dd4bf]/10 transition-colors"
          >
            <FileText size={12} /> {s.cta_wp}
          </button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00231e]/40 via-[#00153a]/30 to-[#000818]" />
          {!reduce && (
            <>
              <motion.div
                className="absolute -top-20 right-0 w-[560px] h-[340px] rounded-full bg-[#2dd4bf]/8 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 13, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-[440px] h-[220px] rounded-full bg-[#facc15]/10 blur-3xl"
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
            <div className="flex items-center gap-2 text-xs text-[#2dd4bf] bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 rounded-full px-3 py-1 mb-6 w-fit">
              <RefreshCw size={11} /> {s.eyebrow}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight leading-[0.98]">
              {s.hero_title}
              <br />
              <span className="bg-gradient-to-r from-[#2dd4bf] via-[#38bdf8] to-[#facc15] bg-clip-text text-transparent text-2xl md:text-4xl">
                {s.hero_accent}
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {s.hero_lead}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <KpiTile Icon={Recycle} val={`${recoveryRate}%`} label={s.kpi_recovery} color={ACCENT} trend="up" />
              <KpiTile Icon={Droplets} val={`${reusePct}%`} label={s.kpi_reuse} color="#38bdf8" trend="up" />
              <KpiTile Icon={Trash2} val={`${diverted}%`} label={s.kpi_diverted} color="#84cc16" trend="up" />
              <KpiTile Icon={Leaf} val={String(co2Avoided)} label={s.kpi_co2} color={ACCENT2} trend="up" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CLOSED LOOP (centerpiece) ══ */}
      <Section id="loop" eyebrow={s.loop_eyebrow} title={s.loop_title} subtitle={s.loop_sub}>
        <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4 md:p-6">

          {/* Sliders */}
          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                  {s.slider_recycle}
                </label>
                <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{recycle}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={recycle}
                onChange={(e) => setRecycle(Number(e.target.value))}
                className="w-full accent-[#2dd4bf] cursor-pointer"
                aria-label={s.slider_recycle}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#38bdf8' }}>
                  {s.slider_water}
                </label>
                <span className="font-mono text-sm font-bold" style={{ color: '#38bdf8' }}>{waterReuse}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={waterReuse}
                onChange={(e) => setWaterReuse(Number(e.target.value))}
                className="w-full accent-[#38bdf8] cursor-pointer"
                aria-label={s.slider_water}
              />
            </div>
          </div>

          {/* Loop diagram + index */}
          <div className="grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
            <div className="relative">
              <svg viewBox="0 0 480 300" className="w-full h-auto">
                <defs>
                  <marker id="loop-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3"
                    orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L6,3 L0,6 Z" fill={ACCENT} />
                  </marker>
                  <marker id="leak-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3"
                    orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
                  </marker>
                </defs>

                {/* Circular flow arcs between the four nodes */}
                {LOOP_NODES.map((n, i) => {
                  const next = LOOP_NODES[(i + 1) % LOOP_NODES.length];
                  // Curve control point pulled toward the centre for a rounded loop.
                  const cx = 240 + (240 - (n.x + next.x) / 2) * -0.35;
                  const cy = 150 + (150 - (n.y + next.y) / 2) * -0.35;
                  const d = `M ${n.x} ${n.y} Q ${cx} ${cy} ${next.x} ${next.y}`;
                  const strokeW = 3 + recoveredFrac * 7;
                  return (
                    <motion.path
                      key={n.key}
                      d={d}
                      fill="none"
                      stroke={ACCENT}
                      strokeOpacity={0.35 + recoveredFrac * 0.5}
                      strokeLinecap="round"
                      markerEnd="url(#loop-arrow)"
                      initial={false}
                      animate={{ strokeWidth: strokeW }}
                      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
                    />
                  );
                })}

                {/* Leakage arrow out of the "use" node toward landfill */}
                <motion.path
                  d="M 400 150 L 462 210"
                  fill="none"
                  stroke="#f87171"
                  strokeOpacity={0.3 + leakedFrac * 0.55}
                  strokeLinecap="round"
                  markerEnd="url(#leak-arrow)"
                  initial={false}
                  animate={{ strokeWidth: 2 + leakedFrac * 8 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
                />
                <circle cx="470" cy="222" r="10" fill="#f87171" fillOpacity="0.18" stroke="#f87171" strokeOpacity="0.5" />

                {/* Nodes */}
                {LOOP_NODES.map((n) => (
                  <g key={n.key}>
                    <circle cx={n.x} cy={n.y} r="26" fill="#000818" stroke={n.color} strokeOpacity="0.6" strokeWidth="2" />
                    <circle cx={n.x} cy={n.y} r="26" fill={n.color} fillOpacity="0.1" />
                    <text x={n.x} y={n.y + 44} textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
                      {nodeLabel[n.key]}
                    </text>
                  </g>
                ))}
                {/* Node icons (foreignObject-free: simple centred glyph via lucide not usable in svg text) */}
                {LOOP_NODES.map((n) => (
                  <circle key={`dot-${n.key}`} cx={n.x} cy={n.y} r="6" fill={n.color} />
                ))}

                {/* Centre index label */}
                <text x="240" y="146" textAnchor="middle" fill={ACCENT} fontSize="34" fontWeight="800" fontFamily="monospace">
                  {ciPct}%
                </text>
                <text x="240" y="166" textAnchor="middle" fill="#64748b" fontSize="10" letterSpacing="1.5">
                  {s.ci_label.toUpperCase()}
                </text>
              </svg>
            </div>

            {/* Flow split readouts */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{s.flow_recovered}</span>
                  <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{Math.round(recoveredFrac * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: ACCENT }}
                    initial={false}
                    animate={{ width: `${recoveredFrac * 100}%` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{s.flow_leaked}</span>
                  <span className="font-mono text-sm font-bold text-red-400">{Math.round(leakedFrac * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-red-400"
                    initial={false}
                    animate={{ width: `${leakedFrac * 100}%` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f8717118', color: '#f87171' }}>
                  <Trash2 size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">{s.node_leak}</div>
                  <div className="font-mono text-lg font-black text-red-400">{Math.round(leakedFrac * 100)}%</div>
                </div>
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
                <div className="text-[11px] font-mono mt-1" style={{ color: it.color }}>+{Math.round(it.ciBoost * 100)}% CI</div>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_ci}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT }}>{ciPct}%</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.proj_virgin}</div>
            <div className="text-2xl font-black font-mono" style={{ color: '#f87171' }}>{virginPct}%</div>
          </div>
          <div className="bg-[#000d24] border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] text-gray-500 mb-1">{s.interv_active}</div>
            <div className="text-2xl font-black font-mono" style={{ color: ACCENT2 }}>{activeCount}/{INTERVENTIONS.length}</div>
          </div>
        </div>
      </Section>

      {/* ══ TREND CHARTS ══ */}
      <Section id="trends" eyebrow={s.charts_eyebrow} title={s.charts_title} subtitle={s.charts_sub}>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart points={virginSeries} color="#f87171" title={s.chart_virgin_title} unit="%" reduce={reduce} />
          <TrendChart points={valueSeries} color={ACCENT} title={s.chart_value_title} unit="%" reduce={reduce} />
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
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.ci}%</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_ci}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.virgin}%</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_virgin}</div>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <div className="text-sm font-black font-mono" style={{ color: sc.color }}>{sc.waste}%</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{s.scen_metric_waste}</div>
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
            className="rounded-2xl border border-[#2dd4bf]/20 p-8 text-center bg-gradient-to-b from-[#2dd4bf]/5 to-transparent"
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-[#2dd4bf]/10 text-[#2dd4bf]">
              <Recycle size={26} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{s.cta_title}</h2>
            <p className="text-gray-400 text-sm md:text-base mb-7 max-w-xl mx-auto leading-relaxed">{s.cta_sub}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate('/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf] hover:bg-[#2dd4bf]/20 transition-colors text-sm font-medium"
              >
                <Compass size={14} /> {s.cta_roadmap}
              </button>
              <button
                onClick={() => navigate('/whitepaper-full')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#facc15]/10 border border-[#facc15]/30 text-[#facc15] hover:bg-[#facc15]/20 transition-colors text-sm font-medium"
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
