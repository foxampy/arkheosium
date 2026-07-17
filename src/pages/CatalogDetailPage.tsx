import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Cpu, Wrench, Tag, Layers, Activity, Sparkles,
  CheckCircle2, Award, FileText, Download, ChevronDown, ChevronUp,
  MapPin, Gauge, Thermometer, Volume2, Zap, Shield, Droplets,
  Weight, Ruler, Clock, Calendar, Star, Globe, Factory, Package,
  Loader2, AlertTriangle, ExternalLink, Settings,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useSupabaseCatalog, type CatalogItem } from '@/hooks/useSupabaseCatalog';
import { MiniMap } from '@/components/map/MiniMap';

interface CatalogDetailPageProps {
  type: 'technology' | 'equipment';
  id: string;
}

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const cardStyle = {
  background: 'rgba(0,14,40,0.9)',
  border: '1px solid rgba(255,255,255,0.06)',
};

/* ── country flag helper ── */
function countryFlag(country: string | null): string {
  if (!country) return '';
  const map: Record<string, string> = {
    'Германия': '\u{1F1E9}\u{1F1EA}', 'Germany': '\u{1F1E9}\u{1F1EA}',
    'Италия': '\u{1F1EE}\u{1F1F9}', 'Italy': '\u{1F1EE}\u{1F1F9}',
    'Дания': '\u{1F1E9}\u{1F1F0}', 'Denmark': '\u{1F1E9}\u{1F1F0}',
    'Швейцария': '\u{1F1E8}\u{1F1ED}', 'Switzerland': '\u{1F1E8}\u{1F1ED}',
    'Япония': '\u{1F1EF}\u{1F1F5}', 'Japan': '\u{1F1EF}\u{1F1F5}',
    'Китай': '\u{1F1E8}\u{1F1F3}', 'China': '\u{1F1E8}\u{1F1F3}',
    'США': '\u{1F1FA}\u{1F1F8}', 'USA': '\u{1F1FA}\u{1F1F8}',
    'Корея': '\u{1F1F0}\u{1F1F7}', 'South Korea': '\u{1F1F0}\u{1F1F7}',
    'Франция': '\u{1F1EB}\u{1F1F7}', 'France': '\u{1F1EB}\u{1F1F7}',
    'Австрия': '\u{1F1E6}\u{1F1F9}', 'Austria': '\u{1F1E6}\u{1F1F9}',
    'Россия': '\u{1F1F7}\u{1F1FA}', 'Russia': '\u{1F1F7}\u{1F1FA}',
    'Узбекистан': '\u{1F1FA}\u{1F1FF}', 'Uzbekistan': '\u{1F1FA}\u{1F1FF}',
    'Турция': '\u{1F1F9}\u{1F1F7}', 'Turkey': '\u{1F1F9}\u{1F1F7}',
    'Нидерланды': '\u{1F1F3}\u{1F1F1}', 'Netherlands': '\u{1F1F3}\u{1F1F1}',
    'Швеция': '\u{1F1F8}\u{1F1EA}', 'Sweden': '\u{1F1F8}\u{1F1EA}',
    'Финляндия': '\u{1F1EB}\u{1F1EE}', 'Finland': '\u{1F1EB}\u{1F1EE}',
    'Великобритания': '\u{1F1EC}\u{1F1E7}', 'UK': '\u{1F1EC}\u{1F1E7}',
    'Индия': '\u{1F1EE}\u{1F1F3}', 'India': '\u{1F1EE}\u{1F1F3}',
    'Испания': '\u{1F1EA}\u{1F1F8}', 'Spain': '\u{1F1EA}\u{1F1F8}',
    'Израиль': '\u{1F1EE}\u{1F1F1}', 'Israel': '\u{1F1EE}\u{1F1F1}',
  };
  return map[country] ?? '';
}

/* ── price formatter ── */
function formatPrice(min: number | null, max: number | null, currency: string) {
  const fmt = (n: number) => n.toLocaleString('ru-RU');
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
  if (min != null && max != null) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
  if (min != null) return `от ${sym}${fmt(min)}`;
  if (max != null) return `до ${sym}${fmt(max)}`;
  return null;
}

/* ── Section wrapper ── */
function Section({
  title,
  icon: Icon,
  delay = 0,
  children,
  accentColor,
}: {
  title: string;
  icon: typeof Cpu;
  delay?: number;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <motion.div {...fadeUp(delay)} className="rounded-2xl p-5" style={cardStyle}>
      <h2 className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        <Icon className="w-4 h-4" style={{ color: accentColor }} />
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

export default function CatalogDetailPage({ type, id }: CatalogDetailPageProps) {
  const [, setLocation] = useLocation();
  const { fetchItemById } = useSupabaseCatalog();

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installOpen, setInstallOpen] = useState(false);

  const accentColor = type === 'technology' ? '#22d3ee' : '#a78bfa';
  const TypeIcon = type === 'technology' ? Cpu : Wrench;
  const typeLabel = type === 'technology' ? 'Технология' : 'Оборудование';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchItemById(id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить элемент каталога');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, fetchItemById]);

  /* ── Back button ── */
  const backButton = (
    <button
      onClick={() => setLocation('/catalog')}
      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition mt-6 mb-6"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Назад в каталог
    </button>
  );

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen pt-14 pb-8 px-4">
        {backButton}
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: accentColor }} />
          <p className="text-sm text-white/40">Загрузка...</p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !item) {
    return (
      <div className="min-h-screen pt-14 pb-8 px-4">
        {backButton}
        <div className="text-center py-20">
          {error ? (
            <AlertTriangle className="w-12 h-12 text-amber-400/40 mx-auto mb-4" />
          ) : (
            <Sparkles className="w-12 h-12 text-white/10 mx-auto mb-4" />
          )}
          <h2 className="text-lg font-bold text-white/50 mb-2">
            {error ? 'Ошибка' : 'Не найдено'}
          </h2>
          <p className="text-sm text-white/25">
            {error || `${typeLabel} с ID «${id}» не найден в каталоге.`}
          </p>
        </div>
      </div>
    );
  }

  /* ── Derived data ── */
  const specs = item.specifications && typeof item.specifications === 'object' ? Object.entries(item.specifications) : [];
  const optConds = item.optimal_conditions && typeof item.optimal_conditions === 'object' ? Object.entries(item.optimal_conditions) : [];
  const advantages = item.advantages ?? [];
  const applications = item.applications ?? [];
  const certifications = item.certifications ?? [];
  const priceStr = formatPrice(item.price_min, item.price_max, item.price_currency);

  const maturityColor =
    item.maturity_level === 'commercial'
      ? '#4ade80'
      : item.maturity_level && parseInt(item.maturity_level.replace('TRL ', '')) >= 7
        ? '#fbbf24'
        : '#f97316';

  /* ── Technical detail rows ── */
  const techDetails: { label: string; value: string; icon: typeof Cpu }[] = [];
  if (item.power_kw != null) techDetails.push({ label: 'Мощность', value: `${item.power_kw} кВт`, icon: Zap });
  if (item.capacity_m3h != null) techDetails.push({ label: 'Производительность', value: `${item.capacity_m3h} м³/ч`, icon: Droplets });
  if (item.voltage) techDetails.push({ label: 'Напряжение', value: item.voltage, icon: Zap });
  if (item.frequency) techDetails.push({ label: 'Частота', value: item.frequency, icon: Activity });
  if (item.efficiency_percent != null) techDetails.push({ label: 'КПД', value: `${item.efficiency_percent}%`, icon: Gauge });
  if (item.flow_rate_range) techDetails.push({ label: 'Диапазон расхода', value: item.flow_rate_range, icon: Droplets });
  if (item.noise_level_db != null) techDetails.push({ label: 'Уровень шума', value: `${item.noise_level_db} дБ`, icon: Volume2 });
  if (item.operating_temp_min != null || item.operating_temp_max != null) {
    const min = item.operating_temp_min ?? '?';
    const max = item.operating_temp_max ?? '?';
    techDetails.push({ label: 'Температурный диапазон', value: `${min}°C – ${max}°C`, icon: Thermometer });
  }
  if (item.operating_pressure_bar != null) techDetails.push({ label: 'Давление', value: `${item.operating_pressure_bar} бар`, icon: Gauge });
  if (item.material) techDetails.push({ label: 'Материал', value: item.material, icon: Layers });
  if (item.connection_type) techDetails.push({ label: 'Тип соединения', value: item.connection_type, icon: Settings });
  if (item.protection_class) techDetails.push({ label: 'Класс защиты (IP)', value: item.protection_class, icon: Shield });
  if (item.energy_efficiency_class) techDetails.push({ label: 'Энергоэффективность', value: item.energy_efficiency_class, icon: Star });
  if (item.weight_kg != null) techDetails.push({ label: 'Вес', value: `${item.weight_kg} кг`, icon: Weight });
  if (item.dimensions) techDetails.push({ label: 'Габариты', value: item.dimensions, icon: Ruler });

  let sectionDelay = 0.1;
  const nextDelay = () => { sectionDelay += 0.06; return sectionDelay; };

  return (
    <div className="min-h-screen pt-14 pb-8">
      {/* Header */}
      <div className="px-4 pt-6">
        {backButton}

        <motion.div {...fadeUp(0)} className="flex items-start gap-4 mb-5">
          {/* Product image or icon */}
          {item.image_url ? (
            <div
              className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden"
              style={{ border: `1px solid ${accentColor}25`, background: 'rgba(0,14,40,0.6)' }}
            >
              <img
                src={item.image_url}
                alt={item.name_ru}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
            >
              <TypeIcon className="w-8 h-8" style={{ color: accentColor }} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {item.name_ru}
            </h1>
            <p className="text-sm text-white/35 mt-0.5">{item.name_en}</p>

            {/* Manufacturer / Model / Country badges inline */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {item.manufacturer && (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg font-medium"
                  style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}20` }}>
                  <Factory className="w-3 h-3" />
                  {item.manufacturer}
                </span>
              )}
              {item.model_number && (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Package className="w-3 h-3" />
                  {item.model_number}
                </span>
              )}
              {item.country_of_origin && (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-sm">{countryFlag(item.country_of_origin)}</span>
                  {item.country_of_origin}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content sections */}
      <div className="px-4 space-y-4">

        {/* ── Meta badges ── */}
        <motion.div {...fadeUp(0.08)} className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
            style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}20` }}>
            <TypeIcon className="w-3.5 h-3.5" />
            {typeLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Layers className="w-3.5 h-3.5" />
            {item.category}
          </span>
          {item.subcategory && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {item.subcategory}
            </span>
          )}
          {item.maturity_level && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
              style={{ background: `${maturityColor}12`, color: maturityColor, border: `1px solid ${maturityColor}20` }}>
              <Activity className="w-3.5 h-3.5" />
              {item.maturity_level === 'commercial' ? 'Commercial' : item.maturity_level}
            </span>
          )}
        </motion.div>

        {/* ── Price section ── */}
        {priceStr && (
          <motion.div {...fadeUp(nextDelay())}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15` }}>
              <span className="text-lg font-bold" style={{ color: accentColor }}>$</span>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider">{'Цена'}</p>
              <p className="text-lg font-bold text-white">{priceStr}</p>
              {item.price_unit && <p className="text-[11px] text-white/30">{item.price_unit}</p>}
            </div>
          </motion.div>
        )}

        {/* ── Description ── */}
        <Section title={'Описание'} icon={FileText} delay={nextDelay()} accentColor={accentColor}>
          <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
        </Section>

        {/* ── Specifications (JSONB) ── */}
        {specs.length > 0 && (
          <Section title={'Технические характеристики'} icon={Settings} delay={nextDelay()} accentColor={accentColor}>
            <div className="grid gap-px rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {specs.map(([key, value], i) => (
                <div key={key}
                  className="flex justify-between items-center px-4 py-2.5"
                  style={{ background: i % 2 === 0 ? 'rgba(0,14,40,0.8)' : 'rgba(0,14,40,0.5)' }}>
                  <span className="text-xs text-white/45 font-medium">{key}</span>
                  <span className="text-xs text-white/80 font-semibold text-right ml-4">{String(value)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Advantages ── */}
        {advantages.length > 0 && (
          <Section title={'Преимущества'} icon={CheckCircle2} delay={nextDelay()} accentColor={accentColor}>
            <ul className="space-y-2">
              {advantages.map((adv, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Applications (chips) ── */}
        {applications.length > 0 && (
          <Section title={'Области применения'} icon={Tag} delay={nextDelay()} accentColor={accentColor}>
            <div className="flex flex-wrap gap-2">
              {applications.map((app) => (
                <span key={app}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
                  style={{ background: `${accentColor}08`, color: `${accentColor}cc`, border: `1px solid ${accentColor}15` }}>
                  <Tag className="w-3 h-3" />
                  {app}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Certifications (badges) ── */}
        {certifications.length > 0 && (
          <Section title={'Сертификаты'} icon={Award} delay={nextDelay()} accentColor={accentColor}>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span key={cert}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium"
                  style={{ background: '#fbbf2412', color: '#fbbf24', border: '1px solid #fbbf2420' }}>
                  <Award className="w-3 h-3" />
                  {cert}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* ── Optimal conditions (JSONB table) ── */}
        {optConds.length > 0 && (
          <Section title={'Оптимальные условия эксплуатации'} icon={Gauge} delay={nextDelay()} accentColor={accentColor}>
            <div className="grid gap-px rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {optConds.map(([key, value], i) => (
                <div key={key}
                  className="flex justify-between items-center px-4 py-2.5"
                  style={{ background: i % 2 === 0 ? 'rgba(0,14,40,0.8)' : 'rgba(0,14,40,0.5)' }}>
                  <span className="text-xs text-white/45 font-medium">{key}</span>
                  <span className="text-xs text-white/80 font-semibold text-right ml-4">{String(value)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Recommendations (Uzbekistan context) ── */}
        {item.recommendations && (
          <motion.div {...fadeUp(nextDelay())}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(0,14,40,0.95), rgba(34,211,238,0.05))', border: '1px solid rgba(34,211,238,0.12)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider">
                {'Рекомендации для Узбекистана'}
              </h2>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{item.recommendations}</p>
            <div className="absolute top-3 right-3 text-2xl opacity-30">{'\u{1F1FA}\u{1F1FF}'}</div>
          </motion.div>
        )}

        {/* ── Technical details grid ── */}
        {techDetails.length > 0 && (
          <Section title={'Технические детали'} icon={Cpu} delay={nextDelay()} accentColor={accentColor}>
            <div className="grid grid-cols-2 gap-2">
              {techDetails.map(({ label, value, icon: DIcon }) => (
                <div key={label}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <DIcon className="w-3 h-3 text-white/25" />
                    <span className="text-[10px] text-white/35 uppercase tracking-wider font-medium">{label}</span>
                  </div>
                  <p className="text-sm text-white/80 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Maintenance & Lifespan ── */}
        {(item.maintenance_interval || item.lifespan_years != null || item.warranty_years != null) && (
          <Section title={'Обслуживание и срок службы'} icon={Clock} delay={nextDelay()} accentColor={accentColor}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {item.maintenance_interval && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Settings className="w-5 h-5 mx-auto mb-1.5 text-white/25" />
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{'ТО интервал'}</p>
                  <p className="text-sm text-white/80 font-semibold">{item.maintenance_interval}</p>
                </div>
              )}
              {item.lifespan_years != null && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Calendar className="w-5 h-5 mx-auto mb-1.5 text-white/25" />
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{'Срок службы'}</p>
                  <p className="text-sm text-white/80 font-semibold">{item.lifespan_years} {'лет'}</p>
                </div>
              )}
              {item.warranty_years != null && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Shield className="w-5 h-5 mx-auto mb-1.5 text-white/25" />
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{'Гарантия'}</p>
                  <p className="text-sm text-white/80 font-semibold">{item.warranty_years} {'лет'}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── Documentation links ── */}
        {(item.documentation_url || item.datasheet_url || item.website) && (
          <Section title={'Документация'} icon={FileText} delay={nextDelay()} accentColor={accentColor}>
            <div className="flex flex-wrap gap-2">
              {item.datasheet_url && (
                <a href={item.datasheet_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-medium transition-colors hover:opacity-80"
                  style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}20` }}>
                  <Download className="w-3.5 h-3.5" />
                  Datasheet
                </a>
              )}
              {item.documentation_url && (
                <a href={item.documentation_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-medium transition-colors hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <FileText className="w-3.5 h-3.5" />
                  {'Документация'}
                </a>
              )}
              {item.website && (
                <a href={item.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-medium transition-colors hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  {'Веб-сайт'}
                </a>
              )}
            </div>
          </Section>
        )}

        {/* ── Installation notes (expandable) ── */}
        {item.installation_notes && (
          <motion.div {...fadeUp(nextDelay())} className="rounded-2xl overflow-hidden" style={cardStyle}>
            <button
              onClick={() => setInstallOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {'Требования к установке'}
                </span>
              </div>
              {installOpen
                ? <ChevronUp className="w-4 h-4 text-white/30" />
                : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>
            {installOpen && (
              <div className="px-5 pb-5">
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                  {item.installation_notes}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Tags ── */}
        {item.tags && item.tags.length > 0 && (
          <motion.div {...fadeUp(nextDelay())} className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag}
                className="text-[10px] px-2 py-1 rounded-lg text-white/25"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* ── MiniMap placeholder — shown if coordinates exist in specifications ── */}
        {(() => {
          // Try to extract coordinates from specifications or any coordinate fields
          const lat = item.specifications?.latitude || item.specifications?.lat;
          const lng = item.specifications?.longitude || item.specifications?.lng || item.specifications?.lon;
          if (!lat || !lng) return null;
          const latNum = parseFloat(String(lat));
          const lngNum = parseFloat(String(lng));
          if (isNaN(latNum) || isNaN(lngNum)) return null;
          return (
            <Section title={'Местоположение'} icon={Globe} delay={nextDelay()} accentColor={accentColor}>
              <MiniMap
                latitude={latNum}
                longitude={lngNum}
                zoom={10}
                markerColor={accentColor}
                markerType="object"
                height="200px"
                className="rounded-xl"
              />
            </Section>
          );
        })()}
      </div>
    </div>
  );
}
