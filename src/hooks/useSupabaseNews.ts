// src/hooks/useSupabaseNews.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────
export type NewsCategory =
  | 'launch'
  | 'partnership'
  | 'milestone'
  | 'research'
  | 'alert'
  | 'update';

export type NewsDomain =
  | 'water'
  | 'energy'
  | 'minerals'
  | 'nature'
  | 'agriculture'
  | 'climate'
  | 'cross';

export type NewsEntityType =
  | 'object'
  | 'project'
  | 'subject'
  | 'complex'
  | 'resource';

export interface NewsItem {
  id: number;
  slug: string;
  title_ru: string;
  summary_ru: string;
  body_ru: string | null;
  category: NewsCategory;
  domain: NewsDomain | null;
  entity_type: NewsEntityType | null;
  entity_slug: string | null;
  importance: number; // 1..5
  source: string | null;
  published_at: string; // ISO timestamptz
}

// ── Reusable presentation metadata ────────────────────────────
export const CATEGORY_META: Record<string, { labelRu: string; color: string }> = {
  launch:      { labelRu: 'Запуск',      color: '#00e6c8' },
  partnership: { labelRu: 'Партнёрство', color: '#00d4ff' },
  milestone:   { labelRu: 'Веха',        color: '#a3e635' },
  research:    { labelRu: 'Исследование', color: '#c084fc' },
  alert:       { labelRu: 'Алерт',       color: '#f87171' },
  update:      { labelRu: 'Обновление',  color: '#f59e0b' },
};

export const DOMAIN_COLORS: Record<string, string> = {
  water:       '#00e6c8',
  energy:      '#f59e0b',
  minerals:    '#c084fc',
  nature:      '#34d399',
  agriculture: '#a3e635',
  climate:     '#7dd3fc',
  cross:       '#00d4ff',
};

// ── Fallback sample feed (never let the page be empty) ────────
const now = Date.now();
const daysAgo = (d: number): string => new Date(now - d * 86_400_000).toISOString();

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: 1,
    slug: 'planetary-os-v3-launch',
    title_ru: 'Запуск ARKHEOSIUM v3.0 — Planetary OS',
    summary_ru: 'Новая операционная система управления инфраструктурой Центральной Азии: цифровые двойники, 12 AI-модулей и интеграция блокчейна.',
    body_ru: null,
    category: 'launch',
    domain: 'cross',
    entity_type: null,
    entity_slug: null,
    importance: 5,
    source: 'Команда ARKHEOSIUM',
    published_at: daysAgo(0),
  },
  {
    id: 2,
    slug: 'charvak-reservoir-modernization',
    title_ru: 'Модернизация Чарвакского водохранилища завершена',
    summary_ru: 'Обновлены турбины и системы мониторинга уровня. Прирост выработки — 8%, точность прогноза сбросов выросла до 96%.',
    body_ru: null,
    category: 'milestone',
    domain: 'water',
    entity_type: 'object',
    entity_slug: 'charvak-reservoir',
    importance: 4,
    source: 'Госкомводхоз',
    published_at: daysAgo(2),
  },
  {
    id: 3,
    slug: 'adb-partnership-smart-grid',
    title_ru: 'Asian Development Bank — новый партнёр экосистемы',
    summary_ru: 'ADB финансирует программу Smart Water Grid в Ферганской долине на $120M. Установка 3 400 IoT-датчиков стартует в Q4.',
    body_ru: null,
    category: 'partnership',
    domain: 'cross',
    entity_type: 'subject',
    entity_slug: 'asian-development-bank',
    importance: 5,
    source: 'Пресс-служба ADB',
    published_at: daysAgo(3),
  },
  {
    id: 4,
    slug: 'nurek-hpp-maintenance',
    title_ru: 'Нурекская ГЭС: плановое ТО завершено',
    summary_ru: 'Крупнейшая ГЭС региона вернулась в штатный режим. Доступная мощность восстановлена до 3 000 МВт.',
    body_ru: null,
    category: 'update',
    domain: 'energy',
    entity_type: 'object',
    entity_slug: 'nurek-hpp',
    importance: 3,
    source: 'Оператор энергосети',
    published_at: daysAgo(4),
  },
  {
    id: 5,
    slug: 'karshi-canal-water-alert',
    title_ru: 'Алерт: снижение уровня воды — канал Карши',
    summary_ru: 'Уровень воды в главном канале опустился до 34% от нормы. Прогнозируется дефицит полива на 18 000 га.',
    body_ru: null,
    category: 'alert',
    domain: 'water',
    entity_type: 'object',
    entity_slug: 'karshi-canal',
    importance: 5,
    source: 'Система мониторинга',
    published_at: daysAgo(5),
  },
  {
    id: 6,
    slug: 'aral-nature-restoration',
    title_ru: 'Восстановление биоразнообразия Северного Арала',
    summary_ru: 'Площадь водного зеркала выросла на 12% за год. Возобновлён промысел, зафиксировано возвращение 6 видов рыб.',
    body_ru: null,
    category: 'milestone',
    domain: 'nature',
    entity_type: 'project',
    entity_slug: 'aral-restoration',
    importance: 4,
    source: 'Экологический совет',
    published_at: daysAgo(7),
  },
  {
    id: 7,
    slug: 'drip-irrigation-cotton-research',
    title_ru: 'Капельное орошение хлопка: результаты исследования',
    summary_ru: 'Пилот на 4 000 га показал экономию воды 41% при росте урожайности на 17%. Готовится масштабирование по региону.',
    body_ru: null,
    category: 'research',
    domain: 'agriculture',
    entity_type: 'project',
    entity_slug: 'drip-irrigation-pilot',
    importance: 3,
    source: 'Аграрный НИИ',
    published_at: daysAgo(9),
  },
  {
    id: 8,
    slug: 'lithium-deposit-survey',
    title_ru: 'Геологоразведка литиевых месторождений',
    summary_ru: 'Подтверждены промышленные запасы лития в трёх зонах. Оценка ресурсной базы — основа для проектов хранения энергии.',
    body_ru: null,
    category: 'research',
    domain: 'minerals',
    entity_type: 'resource',
    entity_slug: 'lithium-reserves',
    importance: 4,
    source: 'Геологическая служба',
    published_at: daysAgo(12),
  },
  {
    id: 9,
    slug: 'climate-early-warning-launch',
    title_ru: 'Запуск системы климатического раннего предупреждения',
    summary_ru: 'Спутниковый мониторинг засух и паводков теперь охватывает весь бассейн. Прогноз на 14 дней вперёд.',
    body_ru: null,
    category: 'launch',
    domain: 'climate',
    entity_type: 'complex',
    entity_slug: 'climate-observatory',
    importance: 4,
    source: 'Обсерватория ARKHEOSIUM',
    published_at: daysAgo(14),
  },
  {
    id: 10,
    slug: 'solar-desalination-milestone',
    title_ru: 'Солнечная опреснительная станция вышла на проектную мощность',
    summary_ru: 'Гибридный комплекс солнце+опреснение обеспечивает 40 000 м³ пресной воды в сутки без выбросов CO₂.',
    body_ru: null,
    category: 'milestone',
    domain: 'energy',
    entity_type: 'complex',
    entity_slug: 'solar-desalination',
    importance: 4,
    source: 'Оператор комплекса',
    published_at: daysAgo(18),
  },
  {
    id: 11,
    slug: 'iot-sensor-network-update',
    title_ru: 'Сеть IoT-датчиков расширена до 12 000 узлов',
    summary_ru: 'Плотность мониторинга водопотребления удвоилась. Данные поступают в цифровые двойники в реальном времени.',
    body_ru: null,
    category: 'update',
    domain: 'water',
    entity_type: 'resource',
    entity_slug: 'iot-sensor-grid',
    importance: 2,
    source: 'Инфраструктурная команда',
    published_at: daysAgo(21),
  },
  {
    id: 12,
    slug: 'cross-domain-dao-vote',
    title_ru: 'DAO ОС одобрило межотраслевую программу устойчивости',
    summary_ru: 'Голосованием силой VOD принят пакет из 9 инициатив по воде, энергии и природе. Казна выделяет $45M.',
    body_ru: null,
    category: 'partnership',
    domain: 'cross',
    entity_type: 'subject',
    entity_slug: 'arkheosium-dao',
    importance: 3,
    source: 'DAO ARKHEOSIUM',
    published_at: daysAgo(26),
  },
];

// ── Hook ──────────────────────────────────────────────────────
export function useSupabaseNews(): {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
} {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: qError } = await supabase
          .from('news')
          .select('*')
          .order('published_at', { ascending: false })
          .range(0, 500);

        if (cancelled) return;

        if (qError || !data || data.length === 0) {
          // Graceful fallback: table missing/empty or query failed.
          if (qError) setError(qError.message);
          setItems(SAMPLE_NEWS);
        } else {
          setItems(data as NewsItem[]);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Не удалось загрузить новости');
        setItems(SAMPLE_NEWS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}
