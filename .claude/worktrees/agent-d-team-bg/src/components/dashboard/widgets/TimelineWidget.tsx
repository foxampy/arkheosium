// src/components/dashboard/widgets/TimelineWidget.tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TIMELINE_EVENTS = [
  { year: 2003, label: 'Первый проект', desc: 'Аквапарк Ташкент: питьевое качество воды для 1000+ посетителей в день (Culligan)', done: true },
  { year: 2006, label: '$200M+ Туркменистан', desc: 'Реконструкция водопровода Ашхабада: 320 000 м³/сут. — крупнейший контракт в ЦА', done: true },
  { year: 2012, label: 'Culligan Eurasia', desc: 'Производство оборудования водоочистки в Беларуси; экспорт в ТС и СНГ', done: true },
  { year: 2016, label: '30+ объектов', desc: 'АЭС «Балаково», «Минск-Арена», муниципальные водозаборы Беларуси, Туркменистан, Казахстан', done: true },
  { year: 2021, label: 'UNICAP Global', desc: 'Формирование инвестиционной модели unicapinvest.org — подготовка к запуску VODPROM', done: true },
  { year: 2026, label: '🚀 Запуск VODPROM', desc: 'Платформа запущена. Пресейл VOD токена открыт. Конференция ЦА 2026.', done: true },
  { year: 2027, label: 'DAO + DEX листинг', desc: 'Запуск DAO управления. Листинг VOD на децентрализованных биржах.', done: false },
  { year: 2028, label: 'Фаза 2: Глобальная', desc: 'Waste-to-energy, очистка сточных вод, расширение на Азию и Африку', done: false },
];

export function TimelineWidget() {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative pl-6">
        {/* Vertical line */}
        <div
          className="absolute left-[9px] top-1 bottom-1 w-px"
          style={{ background: 'rgba(0,230,200,0.15)' }}
        />

        <div className="space-y-5">
          {TIMELINE_EVENTS.map((evt, i) => (
            <motion.div
              key={evt.year}
              className="relative flex items-start gap-4"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              {/* Dot */}
              <div
                className="absolute -left-6 top-1 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                style={{
                  background: evt.done ? '#000c20' : 'transparent',
                  border: `2px solid ${evt.done ? '#00e6c8' : 'rgba(255,255,255,0.15)'}`,
                }}
              >
                {evt.done && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00e6c8' }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: evt.done ? '#00e6c8' : 'rgba(255,255,255,0.35)' }}
                  >
                    {evt.year}
                  </span>
                  <span className="text-sm font-medium text-white/80">{evt.label}</span>
                  {!evt.done && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30">
                      {t('dashboard.planned_badge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{evt.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
