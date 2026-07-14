import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProjectData } from '@/data/projects/types';

// ─── Section title ────────────────────────────────────────────
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  color = '#00e6c8',
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <h2 className="text-white font-black text-xl leading-tight">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface FAQSectionProps {
  project: ProjectData;
}

// ─── Component ───────────────────────────────────────────────
export default function FAQSection({ project }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <SectionTitle
        icon={FileText}
        title="Ответы на ключевые вопросы"
        subtitle="На основе материалов GTTCI × UNICAP"
        color="#a78bfa"
      />

      <div className="space-y-3">
        {project.faq.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 + i * 0.06 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(0,6,20,0.8)',
                border: `1px solid ${isOpen ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer transition-all"
              >
                <span className="text-white/80 text-sm font-semibold">{item.q}</span>
                {isOpen ? (
                  <ChevronUp size={14} style={{ color: '#a78bfa' }} className="shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-white/30 shrink-0" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-4 pb-4">
                      <p
                        className="text-white/55 text-sm leading-relaxed border-t pt-3"
                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
