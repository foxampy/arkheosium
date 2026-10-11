// ═══════════════════════════════════════════════════════════════
//  VODecology — Project Cover Image / Branded Poster
// ═══════════════════════════════════════════════════════════════
import type { PlatformProject } from '@/data/projects-data';

interface ThemeConfig {
  primary: string;
  secondary: string;
  bg: string;
  gradStart: string;
  gradMid: string;
  gradEnd: string;
}

const PORTFOLIO_THEMES: Record<string, ThemeConfig> = {
  energy_efficiency: {
    primary: '#00e6c8',
    secondary: '#00b4ff',
    bg: 'linear-gradient(135deg, #001830 0%, #002240 50%, #001020 100%)',
    gradStart: '#001830',
    gradMid: '#002240',
    gradEnd: '#001020',
  },
  water_quality: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    bg: 'linear-gradient(135deg, #001030 0%, #001848 50%, #000820 100%)',
    gradStart: '#001030',
    gradMid: '#001848',
    gradEnd: '#000820',
  },
  digital_transformation: {
    primary: '#a78bfa',
    secondary: '#00e6c8',
    bg: 'linear-gradient(135deg, #0d001a 0%, #150030 50%, #000820 100%)',
    gradStart: '#0d001a',
    gradMid: '#150030',
    gradEnd: '#000820',
  },
  environmental: {
    primary: '#4ade80',
    secondary: '#00e6c8',
    bg: 'linear-gradient(135deg, #001a10 0%, #002820 50%, #001010 100%)',
    gradStart: '#001a10',
    gradMid: '#002820',
    gradEnd: '#001010',
  },
  governance: {
    primary: '#fbbf24',
    secondary: '#f87171',
    bg: 'linear-gradient(135deg, #1a1000 0%, #281800 50%, #100800 100%)',
    gradStart: '#1a1000',
    gradMid: '#281800',
    gradEnd: '#100800',
  },
};

const DEFAULT_THEME: ThemeConfig = PORTFOLIO_THEMES.energy_efficiency;

const STATUS_LABELS: Record<string, { ru: string; color: string }> = {
  in_implementation: { ru: 'В реализации', color: '#4ade80' },
  in_planning:       { ru: 'Планирование', color: '#fbbf24' },
  planned:           { ru: 'Запланирован', color: '#60a5fa' },
  completed:         { ru: 'Завершён',     color: '#00e6c8' },
  proposed:          { ru: 'Предложен',    color: '#a78bfa' },
  ongoing:           { ru: 'Выполняется',  color: '#34d399' },
  active:            { ru: 'Активный',     color: '#4ade80' },
  pilot_phase:       { ru: 'Пилот',        color: '#a78bfa' },
  long_term:         { ru: 'Долгосрочный', color: '#fb923c' },
  under_development: { ru: 'Разработка',   color: '#94a3b8' },
  feasibility_study: { ru: 'Тех. изучение',color: '#818cf8' },
  in_negotiation:    { ru: 'Переговоры',   color: '#f472b6' },
};

function fmt(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

export interface ProjectCoverImageProps {
  project: PlatformProject;
  className?: string;
  showStats?: boolean;
}

export default function ProjectCoverImage({
  project,
  className = '',
  showStats = true,
}: ProjectCoverImageProps) {
  const theme = PORTFOLIO_THEMES[project.portfolio ?? ''] ?? DEFAULT_THEME;
  const status = STATUS_LABELS[project.status] ?? { ru: project.status, color: '#94a3b8' };

  // Real photo available — use it with a dark overlay
  if (project.image_url && !project.image_url.includes('placeholder')) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl ${className}`}
        style={{ minHeight: 280 }}
      >
        <img
          src={project.image_url}
          alt={project.name_ru}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(0,6,20,0.88) 0%, rgba(0,6,20,0.50) 45%, rgba(0,6,20,0.94) 100%)',
          }}
        />
        {/* Neon top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.primary} 50%, transparent 100%)`,
          }}
        />
        {/* Neon bottom line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.primary}60 50%, transparent 100%)`,
          }}
        />
        <CoverContent
          project={project}
          theme={theme}
          status={status}
          showStats={showStats}
        />
      </div>
    );
  }

  // Fully generated poster (no photo)
  const gridId = `grid-${project.id}`;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        minHeight: 280,
        background: theme.bg,
        border: `1px solid ${theme.primary}20`,
      }}
    >
      {/* SVG grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={theme.primary}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </svg>

      {/* Glow orb top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.primary}1a 0%, transparent 70%)`,
          top: -100,
          right: -100,
        }}
      />
      {/* Glow orb bottom-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.secondary}12 0%, transparent 70%)`,
          bottom: -60,
          left: -60,
        }}
      />

      {/* Neon top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.primary} 50%, transparent 100%)`,
        }}
      />

      <CoverContent
        project={project}
        theme={theme}
        status={status}
        showStats={showStats}
      />
    </div>
  );
}

// ─── Inner content overlay ────────────────────────────────────
interface CoverContentProps {
  project: PlatformProject;
  theme: ThemeConfig;
  status: { ru: string; color: string };
  showStats: boolean;
}

function CoverContent({ project, theme, status, showStats }: CoverContentProps) {
  const budget = project.budget ?? project.budget_total;
  const irr = project.expected_irr ?? project.combined_irr;
  const location =
    project.location ??
    (project.countries ? project.countries.join(', ') : project.country);

  return (
    <div
      className="relative z-10 p-5 flex flex-col justify-between"
      style={{ minHeight: 280 }}
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-3">
        {/* Status + location */}
        <div className="flex flex-col gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit"
            style={{
              background: `${status.color}18`,
              border: `1px solid ${status.color}40`,
              color: status.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: status.color }}
            />
            {status.ru}
          </span>
          {location && (
            <span className="text-white/40 text-xs leading-none">{location}</span>
          )}
        </div>

        {/* Type badge */}
        <div
          className="px-2.5 py-1 rounded-xl text-xs text-right max-w-[140px] leading-snug"
          style={{
            background: `${theme.primary}10`,
            border: `1px solid ${theme.primary}20`,
            color: `${theme.primary}cc`,
          }}
        >
          {project.type_label}
        </div>
      </div>

      {/* ── Project name ── */}
      <div className="my-auto py-4">
        <h2
          className="text-white font-black text-xl sm:text-2xl leading-tight mb-2"
          style={{ textShadow: `0 0 30px ${theme.primary}50` }}
        >
          {project.name_ru}
        </h2>
        {project.description && (
          <p className="text-white/45 text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>
        )}
      </div>

      {/* ── Bottom stats ── */}
      {showStats && (
        <div className="flex items-end gap-5 flex-wrap">
          {budget != null && (
            <div>
              <div className="text-white/35 text-xs mb-0.5">Бюджет</div>
              <div
                className="font-black text-xl leading-none"
                style={{ color: theme.primary }}
              >
                {fmt(budget)}
              </div>
            </div>
          )}
          {irr != null && (
            <div>
              <div className="text-white/35 text-xs mb-0.5">IRR</div>
              <div
                className="font-black text-xl leading-none"
                style={{ color: theme.secondary }}
              >
                {irr}%
              </div>
            </div>
          )}
          {project.payback_period_years != null && (
            <div>
              <div className="text-white/35 text-xs mb-0.5">Окупаемость</div>
              <div className="font-black text-lg leading-none text-white/75">
                {project.payback_period_years}&thinsp;л.
              </div>
            </div>
          )}
          {(project.start_date ?? project.planned_start) != null && (
            <div className="ml-auto text-right">
              <div className="text-white/35 text-xs mb-0.5">Старт</div>
              <div className="text-white/65 text-sm font-semibold">
                {project.start_date ?? project.planned_start}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
