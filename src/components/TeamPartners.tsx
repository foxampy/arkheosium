import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FlaskConical, Handshake, ExternalLink, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: 'easeOut' as const },
  }),
};

interface EntityCardProps {
  icon: React.ReactNode;
  label: string;
  name: string;
  desc: string;
  cta: string;
  href: string;
  delay: number;
}

function EntityCard({ icon, label, name, desc, cta, href, delay }: EntityCardProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-all hover:border-[#00e6c8]/40 hover:bg-[#00e6c8]/5"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#00e6c8]/8 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00e6c8]/20 bg-[#00e6c8]/10 text-[#00e6c8] transition-colors group-hover:bg-[#00e6c8]/20">
          {icon}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-white">{name}</h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-400">{desc}</p>

      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00e6c8] transition-transform group-hover:translate-x-0.5">
        {cta}
        <ExternalLink size={14} />
      </span>
    </motion.a>
  );
}

export default function TeamPartners() {
  const { t } = useTranslation();

  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00e6c8]/20 bg-[#00e6c8]/10 px-4 py-1.5 text-xs text-[#00e6c8]">
            <Sparkles size={12} />
            {t('teamPartners.badge')}
          </div>
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            {t('teamPartners.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
            {t('teamPartners.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <EntityCard
            icon={<FlaskConical size={22} />}
            label={t('teamPartners.team.label')}
            name={t('teamPartners.team.name')}
            desc={t('teamPartners.team.desc')}
            cta={t('teamPartners.team.cta')}
            href="https://foxampyforge.com"
            delay={0}
          />
          <EntityCard
            icon={<Handshake size={22} />}
            label={t('teamPartners.partner.label')}
            name={t('teamPartners.partner.name')}
            desc={t('teamPartners.partner.desc')}
            cta={t('teamPartners.partner.cta')}
            href="https://unicapinvest.org"
            delay={1}
          />
        </div>
      </div>
    </section>
  );
}
