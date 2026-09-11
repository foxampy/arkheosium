/**
 * ResourceExplorerPage — обозреватель ресурсных доменов.
 *
 * На платформе уже есть глобус и карта с переключателем доменов, но там
 * домен — это фильтр отображения. Здесь домен — точка входа: выбрал ресурс
 * и видишь всё, что корпус о нём знает: объекты, субъекты, географию,
 * пересечения с другими доменами и каталог.
 *
 * Дисциплина отображения та же, что в нефтегазовом и экологическом слоях:
 *
 *  1. Ни одного захардкоженного числа. Все счётчики выводятся из
 *     OBJECTS_DATA / ALL_FULL_OBJECTS / SUBJECTS_DATA / PROJECTS_DATA
 *     в useMemo. Появятся записи — цифры изменятся сами.
 *
 *  2. Пустой домен показывается пустым. Домены без объектов не прячутся и
 *     не описываются словами вместо данных: написано «объекты не внесены».
 *
 *  3. Пробел ⟨заполнить⟩ в описании записи не скрывается, а считается и
 *     выносится наружу отдельным счётчиком: незакрытая позиция корпуса —
 *     такая же информация о его состоянии, как и закрытая.
 *
 *  4. Пересечения доменов считаются по данным, а не описываются. Три
 *     измеримых признака связи (субъект-мост, пространственная смежность,
 *     общая административная привязка) плюс общие теги. Порог смежности
 *     назван явно на странице — иначе число «пар» ничего не значит.
 */

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Compass, Layers, Building2, MapPin, Globe2, Map as MapIcon, ArrowRight,
  Search, Boxes, Link2, AlertTriangle, Crosshair, Tag, FolderKanban,
  ChevronRight, Database, Ruler,
} from 'lucide-react';
import {
  DOMAIN_CONFIG, DOMAIN_ORDER, normalizeDomain, type DomainKey,
} from '@/lib/domains';
import { OBJECTS_DATA } from '@/data/objects-data';
import { ALL_FULL_OBJECTS } from '@/data/objects';
import { SUBJECTS_DATA } from '@/data/subjects-data';
import { PROJECTS_DATA } from '@/data/projects-data';
import { OILGAS_CATALOG_SECTIONS, STAGE_LABEL, type CatalogItem } from '@/data/oilgas/catalog';

const ACCENT = '#00e6c8';

/** Маркер незакрытой позиции корпуса. */
const GAP_MARK = '⟨заполнить';

/** Порог, при котором два объекта считаются пространственно смежными. */
const NEAR_KM = 75;

// ── Точность координаты ──────────────────────────────────────────────
// Значения приходят из данных (`coord_precision`); здесь только их
// человекочитаемая подпись и цвет. Отсутствие поля — тоже состояние.

const PRECISION_LABEL: Record<string, string> = {
  exact: 'координата площадки',
  field_centroid: 'центр контура',
  settlement_proxy: 'привязка к посёлку',
  region_proxy: 'только область',
  route_anchor: 'опорная точка трассы',
};

const PRECISION_COLOR: Record<string, string> = {
  exact: '#34d399',
  field_centroid: '#22d3ee',
  settlement_proxy: '#fbbf24',
  region_proxy: '#fb923c',
  route_anchor: '#a78bfa',
};

const PRECISION_ORDER = ['exact', 'field_centroid', 'settlement_proxy', 'route_anchor', 'region_proxy'];

/** Подписи типов из перечисления FullObjectData.ObjectType (водный слой). */
const FULL_TYPE_RU: Record<string, string> = {
  dam: 'Плотина',
  reservoir: 'Водохранилище',
  irrigation_canal: 'Оросительный канал',
  pumping_station: 'Насосная станция',
  water_treatment_facility: 'Водоочистное сооружение',
  mountain_lake: 'Горное озеро',
  pipeline: 'Трубопровод',
  wastewater_plant: 'Очистные сооружения',
  desalination_plant: 'Опреснительная установка',
  groundwater_well: 'Скважина подземных вод',
};

// ── Нормализованные записи корпуса ───────────────────────────────────

interface CorpusObject {
  id: string;
  name: string;
  typeLabel: string;
  country: string;
  region: string;
  district?: string;
  domain: DomainKey;
  precision?: string;
  lat?: number;
  lng?: number;
  tags: string[];
  relatedSubjects: string[];
  sourceCount: number;
  hasGap: boolean;
  /** Есть ли отдельная детальная карточка (ALL_FULL_OBJECTS). */
  full: boolean;
}

interface CorpusSubject {
  id: string;
  name: string;
  typeLabel: string;
  country: string;
  region?: string;
  domain: DomainKey;
  managedObjects: string[];
  tags: string[];
  hasGap: boolean;
}

interface CorpusProject {
  id: string;
  name: string;
  typeLabel: string;
  country: string;
  domain: DomainKey;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Ищем маркер пробела во всех текстовых полях записи. */
function detectGap(r: Record<string, unknown>): boolean {
  for (const key of ['description', 'description_full', 'description_ru', 'description_en', 'notes']) {
    const v = r[key];
    if (typeof v === 'string' && v.includes(GAP_MARK)) return true;
  }
  return false;
}

function pickCoords(r: Record<string, unknown>): { lat?: number; lng?: number } {
  const c = r.coordinates as { lat?: unknown; lng?: unknown } | undefined;
  if (c) {
    const lat = num(c.lat);
    const lng = num(c.lng);
    if (lat !== undefined && lng !== undefined) return { lat, lng };
  }
  const start = r.coordinates_start as { lat?: unknown; lng?: unknown } | undefined;
  if (start) {
    const lat = num(start.lat);
    const lng = num(start.lng);
    if (lat !== undefined && lng !== undefined) return { lat, lng };
  }
  return {};
}

function toCorpusObject(r: Record<string, unknown>, full: boolean): CorpusObject | null {
  const id = str(r.id);
  if (!id) return null;
  const rawType = str(r.type) ?? '';
  return {
    id,
    name: str(r.name_ru) ?? str(r.name) ?? str(r.name_en) ?? id,
    typeLabel: str(r.type_label) ?? FULL_TYPE_RU[rawType] ?? rawType ?? 'тип не указан',
    country: str(r.country) ?? 'страна не указана',
    region: str(r.region) ?? '',
    district: str(r.district),
    domain: normalizeDomain(str(r.domain)),
    precision: str(r.coord_precision),
    ...pickCoords(r),
    tags: strArr(r.tags),
    relatedSubjects: strArr(r.related_subjects),
    sourceCount: strArr(r.sources).length,
    hasGap: detectGap(r),
    full,
  };
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ── Мелкие визуальные примитивы ──────────────────────────────────────

function Chip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color, border: `1px solid ${color}44`, background: `${color}0e` }}
    >
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, note }: { icon: typeof Boxes; title: string; note?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <Icon size={15} style={{ color: ACCENT }} />
        <h3 className="text-[15px] font-semibold text-slate-100">{title}</h3>
      </div>
      {note && <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">{note}</p>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      className="rounded-xl px-4 py-5 text-[13px] text-slate-400 flex items-start gap-2.5"
      style={{ background: 'rgba(148,163,184,0.05)', border: '1px dashed rgba(148,163,184,0.20)' }}
    >
      <AlertTriangle size={15} className="text-slate-500 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

// ── Страница ─────────────────────────────────────────────────────────

type TabId = 'objects' | 'subjects' | 'geo' | 'links' | 'catalog';

const TABS: Array<{ id: TabId; label: string; icon: typeof Boxes }> = [
  { id: 'objects', label: 'Объекты', icon: Boxes },
  { id: 'subjects', label: 'Субъекты', icon: Building2 },
  { id: 'geo', label: 'География', icon: MapPin },
  { id: 'links', label: 'Связанные домены', icon: Link2 },
  { id: 'catalog', label: 'Каталог', icon: FolderKanban },
];

export default function ResourceExplorerPage() {
  const [selected, setSelected] = useState<DomainKey | null>(null);
  const [tab, setTab] = useState<TabId>('objects');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(40);

  // ── Корпус: единый нормализованный слой ────────────────────────────
  // Дедупликация по id в том же порядке, что в getAllMapMarkers():
  // запись из OBJECTS_DATA выигрывает у одноимённой из ALL_FULL_OBJECTS,
  // чтобы один объект не был посчитан дважды.
  const objects = useMemo<CorpusObject[]>(() => {
    const seen = new Set<string>();
    const out: CorpusObject[] = [];
    const push = (o: CorpusObject | null) => {
      if (!o || seen.has(o.id)) return;
      seen.add(o.id);
      out.push(o);
    };
    for (const o of OBJECTS_DATA) push(toCorpusObject(o as unknown as Record<string, unknown>, false));
    for (const o of ALL_FULL_OBJECTS) push(toCorpusObject(o as unknown as Record<string, unknown>, true));
    return out;
  }, []);

  const subjects = useMemo<CorpusSubject[]>(() => {
    return SUBJECTS_DATA.map((s) => {
      const r = s as unknown as Record<string, unknown>;
      return {
        id: s.id,
        name: str(r.name_ru) ?? str(r.name) ?? s.id,
        typeLabel: str(r.type_label) ?? str(r.type) ?? 'тип не указан',
        country: str(r.country) ?? 'страна не указана',
        region: str(r.region) ?? str(r.location),
        domain: normalizeDomain(str(r.domain)),
        managedObjects: strArr(r.managed_objects),
        tags: strArr(r.tags),
        hasGap: detectGap(r),
      };
    });
  }, []);

  const projects = useMemo<CorpusProject[]>(() => {
    return PROJECTS_DATA.map((p) => {
      const r = p as unknown as Record<string, unknown>;
      return {
        id: p.id,
        name: str(r.name_ru) ?? str(r.name) ?? p.id,
        typeLabel: str(r.type_label) ?? str(r.type) ?? 'тип не указан',
        country: str(r.country) ?? strArr(r.countries)[0] ?? 'страна не указана',
        domain: normalizeDomain(str(r.domain)),
      };
    });
  }, []);

  const objectById = useMemo(() => {
    const m = new Map<string, CorpusObject>();
    for (const o of objects) m.set(o.id, o);
    return m;
  }, [objects]);

  const subjectById = useMemo(() => {
    const m = new Map<string, CorpusSubject>();
    for (const s of subjects) m.set(s.id, s);
    return m;
  }, [subjects]);

  // ── Счётчики по доменам ────────────────────────────────────────────
  const domainStats = useMemo(() => {
    const base: Record<DomainKey, { objects: number; subjects: number; projects: number; gaps: number; countries: number }> =
      Object.fromEntries(
        DOMAIN_ORDER.map((d) => [d, { objects: 0, subjects: 0, projects: 0, gaps: 0, countries: 0 }]),
      ) as Record<DomainKey, { objects: number; subjects: number; projects: number; gaps: number; countries: number }>;

    const countrySets: Record<string, Set<string>> = {};
    for (const d of DOMAIN_ORDER) countrySets[d] = new Set<string>();

    for (const o of objects) {
      base[o.domain].objects += 1;
      if (o.hasGap) base[o.domain].gaps += 1;
      countrySets[o.domain].add(o.country);
    }
    for (const s of subjects) {
      base[s.domain].subjects += 1;
      if (s.hasGap) base[s.domain].gaps += 1;
    }
    for (const p of projects) base[p.domain].projects += 1;
    for (const d of DOMAIN_ORDER) base[d].countries = countrySets[d].size;
    return base;
  }, [objects, subjects, projects]);

  const totals = useMemo(
    () => ({
      objects: objects.length,
      subjects: subjects.length,
      projects: projects.length,
      gaps: objects.filter((o) => o.hasGap).length + subjects.filter((s) => s.hasGap).length,
      filled: DOMAIN_ORDER.filter((d) => domainStats[d].objects > 0).length,
    }),
    [objects, subjects, projects, domainStats],
  );

  // ── Срез выбранного домена ─────────────────────────────────────────
  const domainObjects = useMemo(
    () => (selected ? objects.filter((o) => o.domain === selected) : []),
    [objects, selected],
  );
  const domainSubjects = useMemo(
    () => (selected ? subjects.filter((s) => s.domain === selected) : []),
    [subjects, selected],
  );
  const domainProjects = useMemo(
    () => (selected ? projects.filter((p) => p.domain === selected) : []),
    [projects, selected],
  );

  const visibleObjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return domainObjects;
    return domainObjects.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.typeLabel.toLowerCase().includes(q) ||
        o.country.toLowerCase().includes(q) ||
        o.region.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [domainObjects, query]);

  /** Распределение объектов домена по точности координаты. */
  const precisionStats = useMemo(() => {
    const c: Record<string, number> = {};
    let unknown = 0;
    for (const o of domainObjects) {
      if (o.precision) c[o.precision] = (c[o.precision] ?? 0) + 1;
      else unknown += 1;
    }
    return { c, unknown };
  }, [domainObjects]);

  /** География: страна → регионы → счётчики. */
  const geoTree = useMemo(() => {
    const byCountry = new Map<string, Map<string, number>>();
    for (const o of domainObjects) {
      if (!byCountry.has(o.country)) byCountry.set(o.country, new Map());
      const regions = byCountry.get(o.country)!;
      const key = o.region || '— регион не указан';
      regions.set(key, (regions.get(key) ?? 0) + 1);
    }
    return [...byCountry.entries()]
      .map(([country, regions]) => ({
        country,
        total: [...regions.values()].reduce((a, b) => a + b, 0),
        regions: [...regions.entries()].sort((a, b) => b[1] - a[1]),
      }))
      .sort((a, b) => b.total - a.total);
  }, [domainObjects]);

  const withCoords = useMemo(() => domainObjects.filter((o) => o.lat !== undefined).length, [domainObjects]);

  // ── Пересечения доменов: считаются, а не описываются ───────────────
  const crossLinks = useMemo(() => {
    if (!selected) return [];

    const selGeoKeys = new Map<string, number>();
    for (const o of domainObjects) {
      if (!o.region) continue;
      const k = `${o.country}|${o.region}`;
      selGeoKeys.set(k, (selGeoKeys.get(k) ?? 0) + 1);
    }
    const selTags = new Map<string, number>();
    for (const o of domainObjects) for (const t of o.tags) selTags.set(t, (selTags.get(t) ?? 0) + 1);

    return DOMAIN_ORDER.filter((d) => d !== selected)
      .map((other) => {
        const otherObjects = objects.filter((o) => o.domain === other);
        const otherSubjects = subjects.filter((s) => s.domain === other);

        // 1. Субъект-мост: субъект одного домена управляет объектом другого,
        //    либо объект одного домена ссылается на субъект другого.
        const bridgeSet = new Set<string>();
        const bridges: Array<{ subjectId: string; subjectName: string; objectId: string; objectName: string; dir: string }> = [];
        const addBridge = (s: CorpusSubject, o: CorpusObject, dir: string) => {
          const k = `${s.id}>${o.id}`;
          if (bridgeSet.has(k)) return;
          bridgeSet.add(k);
          bridges.push({ subjectId: s.id, subjectName: s.name, objectId: o.id, objectName: o.name, dir });
        };
        for (const s of domainSubjects) {
          for (const oid of s.managedObjects) {
            const o = objectById.get(oid);
            if (o && o.domain === other) addBridge(s, o, 'управляет');
          }
        }
        for (const s of otherSubjects) {
          for (const oid of s.managedObjects) {
            const o = objectById.get(oid);
            if (o && o.domain === selected) addBridge(s, o, 'управляет');
          }
        }
        for (const o of domainObjects) {
          for (const sid of o.relatedSubjects) {
            const s = subjectById.get(sid);
            if (s && s.domain === other) addBridge(s, o, 'связан');
          }
        }

        // 2. Пространственная смежность: пары объектов разных доменов
        //    в пределах NEAR_KM. Именно этот признак сшивает метановые
        //    точки наблюдения с промыслами — без ручного проставления связи.
        const pairs: Array<{ a: CorpusObject; b: CorpusObject; km: number }> = [];
        for (const a of domainObjects) {
          if (a.lat === undefined || a.lng === undefined) continue;
          for (const b of otherObjects) {
            if (b.lat === undefined || b.lng === undefined) continue;
            const km = haversineKm(a.lat, a.lng, b.lat, b.lng);
            if (km <= NEAR_KM) pairs.push({ a, b, km });
          }
        }
        pairs.sort((x, y) => x.km - y.km);

        // 3. Общая административная привязка (страна + регион).
        const otherGeoKeys = new Map<string, number>();
        for (const o of otherObjects) {
          if (!o.region) continue;
          const k = `${o.country}|${o.region}`;
          otherGeoKeys.set(k, (otherGeoKeys.get(k) ?? 0) + 1);
        }
        const sharedGeo: Array<{ label: string; here: number; there: number }> = [];
        for (const [k, here] of selGeoKeys) {
          const there = otherGeoKeys.get(k);
          if (there) sharedGeo.push({ label: k.split('|')[1], here, there });
        }
        sharedGeo.sort((x, y) => y.here + y.there - (x.here + x.there));

        // 4. Общие теги.
        const otherTags = new Map<string, number>();
        for (const o of otherObjects) for (const t of o.tags) otherTags.set(t, (otherTags.get(t) ?? 0) + 1);
        const sharedTags: Array<{ tag: string; here: number; there: number }> = [];
        for (const [t, here] of selTags) {
          const there = otherTags.get(t);
          if (there) sharedTags.push({ tag: t, here, there });
        }
        sharedTags.sort((x, y) => y.here + y.there - (x.here + x.there));

        return {
          domain: other,
          objectCount: otherObjects.length,
          subjectCount: otherSubjects.length,
          bridges,
          pairs,
          sharedGeo,
          sharedTags,
          score: bridges.length + pairs.length + sharedGeo.length + sharedTags.length,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [selected, objects, subjects, domainObjects, domainSubjects, objectById, subjectById]);

  // ── Каталог ────────────────────────────────────────────────────────
  // Собран пока только для нефтегаза. Для остальных доменов это
  // констатируется прямо, а не заполняется правдоподобным текстом.
  const catalogSections = selected === 'oilgas' ? OILGAS_CATALOG_SECTIONS : null;
  const catalogTotal = useMemo(
    () => (catalogSections ? catalogSections.reduce((a, s) => a + s.items.length, 0) : 0),
    [catalogSections],
  );
  const catalogByStage = useMemo(() => {
    if (!catalogSections) return [];
    const c = new Map<string, number>();
    for (const s of catalogSections) {
      for (const it of s.items as readonly CatalogItem[]) c.set(it.stage, (c.get(it.stage) ?? 0) + 1);
    }
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [catalogSections]);

  const meta = selected ? DOMAIN_CONFIG[selected] : null;

  const selectDomain = (d: DomainKey) => {
    setSelected((prev) => (prev === d ? null : d));
    setTab('objects');
    setQuery('');
    setLimit(40);
  };

  return (
    <div className="min-h-screen text-slate-200">
      {/* ── Шапка ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden border-b"
        style={{
          borderColor: `${ACCENT}22`,
          background: 'linear-gradient(160deg, rgba(0,230,200,0.10), rgba(2,8,23,0) 60%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <Compass size={18} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: ACCENT }}>
              Обозреватель ресурсов
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-3xl">
            Один ресурс — и всё, что с ним связано
          </h1>
          <p className="text-[14px] sm:text-base text-slate-400 mt-4 max-w-2xl leading-relaxed">
            Глобус и карта показывают домен как фильтр отображения. Здесь домен — точка входа:
            объекты, субъекты, география, пересечения с другими доменами и каталог. Все числа
            на странице вычисляются из корпуса при загрузке; ни одно не проставлено вручную.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { v: String(totals.objects), l: 'объектов в корпусе' },
              { v: String(totals.subjects), l: 'субъектов' },
              { v: String(totals.projects), l: 'проектов' },
              { v: `${totals.filled} / ${DOMAIN_ORDER.length}`, l: 'доменов с объектами' },
              { v: String(totals.gaps), l: 'записей с ⟨заполнить⟩' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: ACCENT }}>{s.v}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ── Выбор ресурса ───────────────────────────────────────── */}
        <SectionTitle
          icon={Layers}
          title="Выберите ресурс"
          note={`Порядок доменов — DOMAIN_ORDER. Счётчики считаны из корпуса. Домен без объектов приглушён, но не скрыт: пустота — тоже сведение о состоянии базы. Записи без явного поля domain относятся к домену «Вода» — это поведение normalizeDomain, а не отдельно проставленная принадлежность. Считается только статический корпус репозитория — OBJECTS_DATA и ALL_FULL_OBJECTS. Глобус и карта показывают поверх него ещё и записи из Supabase, поэтому их чипы дают числа больше: по домену, где здесь написано «объекты не внесены», на глобусе метки быть могут. Расхождение названо, а не сглажено — это два разных источника.`}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {DOMAIN_ORDER.map((d) => {
            const m = DOMAIN_CONFIG[d];
            const st = domainStats[d];
            const empty = st.objects === 0;
            const active = selected === d;
            return (
              <button
                key={d}
                onClick={() => selectDomain(d)}
                className="text-left rounded-xl p-4 transition-all"
                style={{
                  border: `1px solid ${active ? `${m.color}88` : empty ? 'rgba(148,163,184,0.14)' : `${m.color}33`}`,
                  background: active ? `${m.color}16` : 'rgba(2,10,26,0.6)',
                  opacity: empty && !active ? 0.55 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl leading-none">{m.emoji}</span>
                  <ChevronRight
                    size={15}
                    className="shrink-0 mt-1 transition-transform"
                    style={{ color: m.color, transform: active ? 'rotate(90deg)' : 'none' }}
                  />
                </div>
                <div className="mt-2.5 font-semibold text-[15px]" style={{ color: empty ? '#94a3b8' : m.color }}>
                  {m.labelRu}
                </div>
                <div className="text-[10.5px] text-slate-500 uppercase tracking-wide">{m.labelEn}</div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="text-slate-500">объекты</span>
                    <span className="font-bold" style={{ color: empty ? '#64748b' : m.color }}>{st.objects}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="text-slate-500">субъекты</span>
                    <span className="font-bold text-slate-300">{st.subjects}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="text-slate-500">проекты</span>
                    <span className="font-bold text-slate-300">{st.projects}</span>
                  </div>
                </div>

                {empty ? (
                  <div className="mt-3 text-[11px] text-slate-500 leading-snug">
                    Объекты не внесены. Домен объявлен в конфигурации, корпус по нему пуст.
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Chip color="#64748b">{st.countries} стр.</Chip>
                    {st.gaps > 0 && <Chip color="#fbbf24">{st.gaps} ⟨заполнить⟩</Chip>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Разворот выбранного домена ──────────────────────────── */}
        {!selected || !meta ? (
          <div
            className="rounded-xl px-5 py-8 text-center"
            style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.14)' }}
          >
            <Database size={22} className="mx-auto mb-3 text-slate-600" />
            <p className="text-[13.5px] text-slate-400 max-w-lg mx-auto leading-relaxed">
              Выберите домен выше. Развернётся всё, что корпус знает о ресурсе: список объектов
              с уровнем точности координаты, операторы и регуляторы, разбивка по странам
              и регионам, измеренные пересечения с другими доменами и состояние каталога.
            </p>
          </div>
        ) : (
          <div>
            {/* Заголовок домена */}
            <div
              className="rounded-xl p-5 mb-5"
              style={{ background: `${meta.color}0e`, border: `1px solid ${meta.color}33` }}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-3xl leading-none">{meta.emoji}</span>
                <div className="flex-1 min-w-[220px]">
                  <h2 className="text-xl font-bold" style={{ color: meta.color }}>
                    {meta.labelRu} <span className="text-slate-500 font-normal text-sm">· {meta.labelEn}</span>
                  </h2>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[12.5px] text-slate-400">
                    <span><b className="text-slate-200">{domainObjects.length}</b> объектов</span>
                    <span><b className="text-slate-200">{domainSubjects.length}</b> субъектов</span>
                    <span><b className="text-slate-200">{domainProjects.length}</b> проектов</span>
                    <span><b className="text-slate-200">{withCoords}</b> с координатой</span>
                    <span><b className="text-slate-200">{geoTree.length}</b> стран</span>
                    {domainStats[selected].gaps > 0 && (
                      <span className="text-amber-300/90">
                        <b>{domainStats[selected].gaps}</b> записей с ⟨заполнить⟩
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{ background: `${meta.color}1c`, color: meta.color }}
                  >
                    <MapIcon size={13} /> Карта
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{ background: 'rgba(148,163,184,0.10)', color: '#cbd5e1' }}
                  >
                    <Globe2 size={13} /> Глобус
                  </Link>
                </div>
              </div>

              {/* Проекты домена — карточка обещает счётчик, значит к ним
                  должен быть переход, а не только цифра. */}
              {domainProjects.length > 0 && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: `${meta.color}22` }}>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-2">
                    Проекты домена
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {domainProjects.slice(0, 12).map((p) => (
                      <Link
                        key={p.id}
                        href={`/hub/project/${p.id}`}
                        className="text-[11.5px] px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-colors"
                        style={{ background: 'rgba(148,163,184,0.08)' }}
                      >
                        {p.name}
                      </Link>
                    ))}
                    {domainProjects.length > 12 && (
                      <Link
                        href="/hub/projects"
                        className="text-[11.5px] px-2.5 py-1 rounded-lg"
                        style={{ background: `${meta.color}18`, color: meta.color }}
                      >
                        ещё {domainProjects.length - 12} →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Вкладки */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {TABS.map((t) => {
                const Icon = t.icon;
                const on = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors"
                    style={{
                      background: on ? `${meta.color}1c` : 'rgba(148,163,184,0.06)',
                      color: on ? meta.color : '#94a3b8',
                      border: `1px solid ${on ? `${meta.color}44` : 'transparent'}`,
                    }}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* ── Объекты ─────────────────────────────────────────── */}
            {tab === 'objects' && (
              <div>
                {domainObjects.length === 0 ? (
                  <Empty text={`Объекты домена «${meta.labelRu}» не внесены. Домен объявлен в DOMAIN_CONFIG, но ни одна запись корпуса на него не указывает. Это состояние базы, а не ошибка отображения.`} />
                ) : (
                  <>
                    {/* Точность координаты — сводкой над списком */}
                    <div
                      className="rounded-xl p-4 mb-4"
                      style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.14)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Ruler size={14} className="text-slate-500" />
                        <span className="text-[12px] text-slate-400">
                          Точность координаты по домену — как далеко точка может отстоять от объекта
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRECISION_ORDER.filter((p) => precisionStats.c[p]).map((p) => (
                          <Chip key={p} color={PRECISION_COLOR[p] ?? '#64748b'}>
                            {PRECISION_LABEL[p] ?? p} — {precisionStats.c[p]}
                          </Chip>
                        ))}
                        {Object.keys(precisionStats.c)
                          .filter((p) => !PRECISION_ORDER.includes(p))
                          .map((p) => (
                            <Chip key={p} color="#94a3b8">{p} — {precisionStats.c[p]}</Chip>
                          ))}
                        {precisionStats.unknown > 0 && (
                          <Chip color="#64748b">точность не указана — {precisionStats.unknown}</Chip>
                        )}
                      </div>
                    </div>

                    {/* Поиск */}
                    <div
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-4"
                      style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.14)' }}
                    >
                      <Search size={15} className="text-slate-500 shrink-0" />
                      <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setLimit(40); }}
                        placeholder="Название, тип, страна, регион, тег, ID"
                        className="bg-transparent outline-none text-[13px] text-slate-200 placeholder:text-slate-600 w-full"
                      />
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {visibleObjects.length} из {domainObjects.length}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {visibleObjects.slice(0, limit).map((o) => (
                        <Link
                          key={o.id}
                          href={`/hub/object/${o.id}`}
                          className="block rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
                          style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.12)' }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[10px] text-slate-500 font-mono">{o.id}</span>
                                {o.precision && (
                                  <Chip color={PRECISION_COLOR[o.precision] ?? '#94a3b8'}>
                                    {PRECISION_LABEL[o.precision] ?? o.precision}
                                  </Chip>
                                )}
                                {!o.precision && <Chip color="#64748b">точность не указана</Chip>}
                                {o.hasGap && <Chip color="#fbbf24">⟨заполнить⟩</Chip>}
                                {o.sourceCount > 0 && <Chip color="#64748b">источников: {o.sourceCount}</Chip>}
                              </div>
                              <div className="text-[14px] font-semibold text-slate-100 leading-snug">{o.name}</div>
                              <div className="text-[12px] text-slate-400 mt-0.5">
                                {o.typeLabel}
                                <span className="text-slate-600"> · </span>
                                {o.country}
                                {o.region && <><span className="text-slate-600"> · </span>{o.region}</>}
                                {o.district && <><span className="text-slate-600"> · </span>{o.district}</>}
                              </div>
                            </div>
                            <ArrowRight size={15} className="text-slate-600 shrink-0 mt-1" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {visibleObjects.length > limit && (
                      <button
                        onClick={() => setLimit((v) => v + 60)}
                        className="mt-3 w-full py-2.5 rounded-xl text-[12.5px] font-semibold"
                        style={{ background: `${meta.color}14`, color: meta.color }}
                      >
                        Показать ещё {Math.min(60, visibleObjects.length - limit)} из {visibleObjects.length - limit}
                      </button>
                    )}
                    {visibleObjects.length === 0 && (
                      <Empty text="По запросу ничего не найдено. Поиск идёт по названию, типу, стране, региону, тегам и ID." />
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Субъекты ────────────────────────────────────────── */}
            {tab === 'subjects' && (
              <div>
                <SectionTitle
                  icon={Building2}
                  title="Операторы, регуляторы и организации домена"
                  note="Координата субъекта — это адрес офиса, а не координата актива. Разделение объектов и субъектов существует ровно для того, чтобы одно не подменяло другое. Число управляемых объектов показано в двух видах: заявлено в записи и подтверждено наличием объекта в корпусе."
                />
                {domainSubjects.length === 0 ? (
                  <Empty text={`Субъекты домена «${meta.labelRu}» не внесены. Ни одна запись SUBJECTS_DATA не указывает на этот домен.`} />
                ) : (
                  <div className="space-y-1.5">
                    {domainSubjects.map((s) => {
                      const resolved = s.managedObjects.filter((id) => objectById.has(id));
                      const foreign = resolved.filter((id) => objectById.get(id)!.domain !== s.domain).length;
                      return (
                        <Link
                          key={s.id}
                          href={`/hub/subject/${s.id}`}
                          className="block rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
                          style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.12)' }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[10px] text-slate-500 font-mono">{s.id}</span>
                                {s.managedObjects.length > 0 && (
                                  <Chip color={meta.color}>
                                    объектов: {resolved.length} из {s.managedObjects.length} заявленных
                                  </Chip>
                                )}
                                {foreign > 0 && <Chip color="#a78bfa">из них в других доменах: {foreign}</Chip>}
                                {s.hasGap && <Chip color="#fbbf24">⟨заполнить⟩</Chip>}
                              </div>
                              <div className="text-[14px] font-semibold text-slate-100 leading-snug">{s.name}</div>
                              <div className="text-[12px] text-slate-400 mt-0.5">
                                {s.typeLabel}
                                <span className="text-slate-600"> · </span>
                                {s.country}
                                {s.region && <><span className="text-slate-600"> · </span>{s.region}</>}
                              </div>
                            </div>
                            <ArrowRight size={15} className="text-slate-600 shrink-0 mt-1" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── География ───────────────────────────────────────── */}
            {tab === 'geo' && (
              <div>
                <SectionTitle
                  icon={MapPin}
                  title="Разбивка по странам и регионам"
                  note={`${withCoords} из ${domainObjects.length} объектов домена несут координату — остальные существуют в корпусе как записи, но на карту не попадают. Регион берётся из поля region записи как есть; «регион не указан» означает именно это, а не отсутствие региона у объекта.`}
                />
                {geoTree.length === 0 ? (
                  <Empty text="Географическая разбивка пуста: объектов домена в корпусе нет." />
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {geoTree.map((c) => (
                        <div
                          key={c.country}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.14)' }}
                        >
                          <div className="flex items-baseline justify-between gap-2 mb-3">
                            <span className="text-[14px] font-semibold text-slate-100">{c.country}</span>
                            <span className="text-[16px] font-bold" style={{ color: meta.color }}>{c.total}</span>
                          </div>
                          <div className="space-y-1">
                            {c.regions.map(([r, n]) => (
                              <div key={r} className="flex items-baseline justify-between gap-2 text-[12px]">
                                <span className="text-slate-400 truncate">{r}</span>
                                <span className="text-slate-300 font-medium shrink-0">{n}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-5">
                      <Link
                        href="/map"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-900"
                        style={{ background: meta.color }}
                      >
                        <MapIcon size={14} /> Открыть карту с доменными фильтрами
                      </Link>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-semibold"
                        style={{ background: 'rgba(148,163,184,0.10)', color: '#cbd5e1' }}
                      >
                        <Globe2 size={14} /> Открыть глобус
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Связанные домены ────────────────────────────────── */}
            {tab === 'links' && (
              <div>
                <SectionTitle
                  icon={Link2}
                  title="Где домены пересекаются"
                  note={`Пересечение здесь измеряется, а не описывается словами. Четыре признака: субъект-мост (субъект одного домена управляет объектом другого или объект ссылается на субъект другого), пространственная смежность объектов в пределах ${NEAR_KM} км, общая административная привязка (страна + регион) и общие теги. Порог ${NEAR_KM} км выбран под точность корпуса: у метановых точек наблюдения coord_precision — region_proxy, и требовать совпадения ближе значило бы отбросить реальные связи.`}
                />
                {crossLinks.filter((l) => l.score > 0).length === 0 ? (
                  <Empty text="Измеримых пересечений с другими доменами не найдено: ни субъект-мостов, ни смежных объектов, ни общих регионов или тегов." />
                ) : (
                  <div className="space-y-3">
                    {crossLinks.map((l) => {
                      const m = DOMAIN_CONFIG[l.domain];
                      if (l.score === 0) return null;
                      return (
                        <div
                          key={l.domain}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(2,10,26,0.6)', border: `1px solid ${m.color}30` }}
                        >
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className="text-lg leading-none">{m.emoji}</span>
                            <button
                              onClick={() => selectDomain(l.domain)}
                              className="text-[15px] font-semibold hover:underline"
                              style={{ color: m.color }}
                            >
                              {m.labelRu}
                            </button>
                            <span className="text-[11.5px] text-slate-500">
                              {l.objectCount} объектов · {l.subjectCount} субъектов
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-4 gap-2 mb-3">
                            {[
                              { n: l.bridges.length, l: 'субъект-мостов' },
                              { n: l.pairs.length, l: `пар ближе ${NEAR_KM} км` },
                              { n: l.sharedGeo.length, l: 'общих регионов' },
                              { n: l.sharedTags.length, l: 'общих тегов' },
                            ].map((x) => (
                              <div
                                key={x.l}
                                className="rounded-lg px-3 py-2"
                                style={{ background: x.n > 0 ? `${m.color}12` : 'rgba(148,163,184,0.05)' }}
                              >
                                <div
                                  className="text-lg font-bold leading-none"
                                  style={{ color: x.n > 0 ? m.color : '#64748b' }}
                                >
                                  {x.n}
                                </div>
                                <div className="text-[10.5px] text-slate-500 mt-1">{x.l}</div>
                              </div>
                            ))}
                          </div>

                          {l.bridges.length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1.5">
                                Субъект-мосты
                              </div>
                              <ul className="space-y-1">
                                {l.bridges.slice(0, 6).map((b) => (
                                  <li key={`${b.subjectId}-${b.objectId}`} className="text-[12px] text-slate-400 leading-relaxed">
                                    <Link href={`/hub/subject/${b.subjectId}`} className="text-slate-200 hover:underline">
                                      {b.subjectName}
                                    </Link>
                                    <span className="text-slate-600"> {b.dir} </span>
                                    <Link href={`/hub/object/${b.objectId}`} className="text-slate-200 hover:underline">
                                      {b.objectName}
                                    </Link>
                                  </li>
                                ))}
                                {l.bridges.length > 6 && (
                                  <li className="text-[11.5px] text-slate-500">и ещё {l.bridges.length - 6}</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {l.pairs.length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                                <Crosshair size={11} /> Пространственная смежность
                              </div>
                              <ul className="space-y-1">
                                {l.pairs.slice(0, 6).map((p) => (
                                  <li key={`${p.a.id}-${p.b.id}`} className="text-[12px] text-slate-400 leading-relaxed">
                                    <Link href={`/hub/object/${p.a.id}`} className="text-slate-200 hover:underline">
                                      {p.a.name}
                                    </Link>
                                    <span className="text-slate-600"> ↔ </span>
                                    <Link href={`/hub/object/${p.b.id}`} className="text-slate-200 hover:underline">
                                      {p.b.name}
                                    </Link>
                                    <span className="text-slate-600"> · </span>
                                    <span style={{ color: m.color }}>{p.km < 1 ? '<1' : Math.round(p.km)} км</span>
                                  </li>
                                ))}
                                {l.pairs.length > 6 && (
                                  <li className="text-[11.5px] text-slate-500">и ещё {l.pairs.length - 6} пар</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {l.sharedGeo.length > 0 && (
                            <div className="mb-3">
                              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1.5">
                                Общая административная привязка
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {l.sharedGeo.slice(0, 10).map((g) => (
                                  <Chip key={g.label} color="#64748b">
                                    {g.label} — {g.here} / {g.there}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}

                          {l.sharedTags.length > 0 && (
                            <div>
                              <div className="text-[10.5px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                                <Tag size={11} /> Общие теги
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {l.sharedTags.slice(0, 12).map((t) => (
                                  <Chip key={t.tag} color={m.color}>
                                    {t.tag} — {t.here} / {t.there}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Каталог ─────────────────────────────────────────── */}
            {tab === 'catalog' && (
              <div>
                <SectionTitle
                  icon={FolderKanban}
                  title="Каталог позиций домена"
                  note="Каталог — это R&D, методологии, оборудование, услуги, продукты и проекты, привязанные к домену. Собран он пока не везде; там, где не собран, это написано прямо."
                />
                {catalogSections ? (
                  <>
                    <div
                      className="rounded-xl p-4 mb-3"
                      style={{ background: `${meta.color}0e`, border: `1px solid ${meta.color}33` }}
                    >
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-2xl font-bold" style={{ color: meta.color }}>{catalogTotal}</span>
                        <span className="text-[13px] text-slate-400">
                          позиций в {catalogSections.length} разделах
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {catalogByStage.map(([st, n]) => (
                          <Chip key={st} color="#94a3b8">
                            {STAGE_LABEL[st as keyof typeof STAGE_LABEL] ?? st} — {n}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catalogSections.map((s) => (
                        <div
                          key={s.id}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(2,10,26,0.6)', border: '1px solid rgba(148,163,184,0.14)' }}
                        >
                          <div className="flex items-baseline justify-between gap-2 mb-2">
                            <span className="text-[13.5px] font-semibold text-slate-100">{s.title}</span>
                            <span className="text-[16px] font-bold" style={{ color: meta.color }}>{s.items.length}</span>
                          </div>
                          <ul className="space-y-0.5">
                            {(s.items as readonly CatalogItem[]).slice(0, 4).map((it) => (
                              <li key={it.id} className="text-[11.5px] text-slate-400 leading-snug truncate">
                                {it.title}
                              </li>
                            ))}
                            {s.items.length > 4 && (
                              <li className="text-[11px] text-slate-600">и ещё {s.items.length - 4}</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/oilgas"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12.5px] font-semibold text-slate-900"
                      style={{ background: meta.color }}
                    >
                      Открыть каталог модуля «Газнефть»
                      <ArrowRight size={14} />
                    </Link>
                  </>
                ) : (
                  <Empty
                    text={`Каталог домена «${meta.labelRu}» не собран. Позиции R&D, методологий, оборудования, услуг и продуктов по этому домену в корпус не внесены. Единственный собранный каталог на сегодня — нефтегазовый (src/data/oilgas/catalog.ts).`}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
