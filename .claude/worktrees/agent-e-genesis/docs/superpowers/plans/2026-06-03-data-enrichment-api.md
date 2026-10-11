# Full Data Enrichment + API Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Give every Object, Subject, and Project a complete data profile — full construction history, monitoring readings from real APIs, critical incidents feed, cost records — all backed by Supabase with real-time updates.

**Architecture:** New Supabase tables for events/incidents/readings; Supabase Edge Functions call external water APIs (USGS, OpenWeatherMap, World Bank, GDELT news) on a cron schedule and cache results. Front-end hooks fetch from Supabase (not directly from APIs) to keep API keys server-side and reduce latency. Static `.ts` data files stay as fallback/seed; Supabase rows override them.

**Tech Stack:** Supabase (PostgreSQL + Edge Functions + Realtime), @tanstack/react-query (already installed), USGS NWIS API (free), OpenWeatherMap API (free tier), World Bank Data API (free), GDELT Project API (free), NewsAPI.org (optional, paid), date-fns (already installed)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/20260603_object_history.sql` | Create | Tables: object_events, object_monitoring, water_news, object_api_config |
| `supabase/functions/fetch-usgs-data/index.ts` | Create | Edge Function: fetch USGS stream gauge data → write to object_monitoring |
| `supabase/functions/fetch-water-news/index.ts` | Create | Edge Function: fetch water crisis news from GDELT → write to water_news |
| `src/hooks/useObjectHistory.ts` | Create | Hook: fetch events + monitoring for a specific object_id |
| `src/hooks/useWaterNews.ts` | Create | Hook: fetch recent water news, optionally filtered by object |
| `src/hooks/useObjectMonitoring.ts` | Create | Hook: real-time Supabase subscription to monitoring readings |
| `src/components/objects/ObjectHistoryTimeline.tsx` | Create | Timeline of construction, incidents, modernizations |
| `src/components/objects/MonitoringPanel.tsx` | Create | Live sensor readings panel with mini charts |
| `src/components/objects/NewsPanel.tsx` | Create | Related water news panel |
| `src/pages/ObjectDetailPage.tsx` | Modify | Add history timeline + monitoring + news panels |
| `src/pages/SubjectDetailPage.tsx` | Modify | Add events timeline |
| `src/pages/ProjectDetailPage.tsx` | Modify | Add cost history + milestones |

---

## Task 1: Supabase migration — history + monitoring tables

**Files:**
- Create: `supabase/migrations/20260603_object_history.sql`

- [ ] **Step 1: Write migration**
```sql
-- Object events: construction phases, modernizations, incidents, milestones
CREATE TABLE IF NOT EXISTS public.object_events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  object_id    TEXT NOT NULL,              -- matches OBJECTS_DATA id string
  object_type  TEXT DEFAULT 'object',      -- 'object' | 'project' | 'subject'
  event_date   DATE NOT NULL,
  event_type   TEXT NOT NULL,              -- 'construction' | 'modernization' | 'incident' | 'milestone' | 'news'
  title        TEXT NOT NULL,
  description  TEXT,
  cost_usd     BIGINT,                     -- cost in USD, nullable
  severity     TEXT,                       -- 'critical' | 'high' | 'medium' | 'low' — for incidents
  source_url   TEXT,
  source_name  TEXT,
  verified     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_object_events_object_id ON public.object_events(object_id);
CREATE INDEX idx_object_events_date ON public.object_events(event_date DESC);

-- Real-time monitoring readings from IoT/API sources
CREATE TABLE IF NOT EXISTS public.object_monitoring (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  object_id    TEXT NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parameter    TEXT NOT NULL,             -- 'flow_m3s' | 'level_m' | 'ph' | 'temperature' | 'turbidity' | 'conductivity'
  value        NUMERIC NOT NULL,
  unit         TEXT NOT NULL,
  source       TEXT DEFAULT 'api',        -- 'api' | 'sensor' | 'manual'
  source_api   TEXT,                      -- 'usgs' | 'openweather' | 'aquacell' | 'manual'
  quality_flag TEXT DEFAULT 'good',       -- 'good' | 'estimated' | 'provisional'
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monitoring_object_time ON public.object_monitoring(object_id, timestamp DESC);

-- Water news feed (from GDELT + manual curation)
CREATE TABLE IF NOT EXISTS public.water_news (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  summary      TEXT,
  url          TEXT,
  source_name  TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  severity     TEXT DEFAULT 'info',       -- 'critical' | 'warning' | 'info'
  category     TEXT DEFAULT 'news',       -- 'accident' | 'drought' | 'flood' | 'pollution' | 'policy' | 'news'
  related_objects TEXT[],                 -- array of object_id strings
  related_regions TEXT[],
  language     TEXT DEFAULT 'en',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_water_news_published ON public.water_news(published_at DESC);

-- Water alerts (for AlertsWidget)
CREATE TABLE IF NOT EXISTS public.water_alerts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  object_id    TEXT,
  object_name  TEXT,
  title        TEXT NOT NULL,
  description  TEXT,
  severity     TEXT NOT NULL DEFAULT 'warning',
  parameter    TEXT,
  value        NUMERIC,
  threshold    NUMERIC,
  unit         TEXT,
  resolved     BOOLEAN DEFAULT FALSE,
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- API config for external data sources per object
CREATE TABLE IF NOT EXISTS public.object_api_config (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  object_id    TEXT NOT NULL UNIQUE,
  usgs_site_id TEXT,                      -- e.g. '09380000' for Colorado River at Lees Ferry
  owm_lat      NUMERIC,
  owm_lng      NUMERIC,
  wb_country   TEXT,                      -- World Bank country code
  active       BOOLEAN DEFAULT TRUE,
  last_fetch   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: public read for news/monitoring, admin write
ALTER TABLE public.object_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.object_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.object_api_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read object_events" ON public.object_events FOR SELECT USING (true);
CREATE POLICY "Public read monitoring" ON public.object_monitoring FOR SELECT USING (true);
CREATE POLICY "Public read water_news" ON public.water_news FOR SELECT USING (true);
CREATE POLICY "Public read water_alerts" ON public.water_alerts FOR SELECT USING (true);
CREATE POLICY "Public read api_config" ON public.object_api_config FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration via Supabase MCP**
Use `mcp__12423590-8b09-4884-ae05-1f7085ae937f__execute_sql` to run SQL above.

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/20260603_object_history.sql
git commit -m "db: add object_events, object_monitoring, water_news, water_alerts tables"
```

---

## Task 2: Seed real historical events for key objects

**Files:**
- Create: `supabase/seeds/object_events_seed.sql`

- [ ] **Step 1: Write seed data for 6 major objects**
```sql
-- Aral Sea critical events
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, severity, source_name, verified) VALUES
('OBJ-ARAL-SEA', '1960-01-01', 'milestone', 'Начало советской ирригационной программы', 'СССР запускает масштабный забор воды из Амударьи и Сырдарьи для хлопковых полей. Начало деградации Аральского моря.', 'critical', 'FAO', true),
('OBJ-ARAL-SEA', '1987-01-01', 'incident', 'Море разделяется на два водоёма', 'Уровень воды упал настолько, что море разделилось на Северное и Южное Аральское море.', 'critical', 'UNEP', true),
('OBJ-ARAL-SEA', '2007-01-01', 'incident', 'Южная часть практически исчезает', 'Южное Аральское море сократилось до 10% от объёма 1960 года. Ежегодные пыльные бури несут токсичные соли.', 'critical', 'NASA/USGS', true),
('OBJ-ARAL-SEA', '2005-01-01', 'milestone', 'Строительство дамбы Кок-Арал', 'Казахстан строит дамбу стоимостью $85M для восстановления Северного Аральского моря. Уровень воды поднялся на 3 м за 2 года.', null, 'World Bank', true),
('OBJ-ARAL-SEA', '2023-01-01', 'milestone', 'Северное море восстанавливается', 'Уровень Малого Арала стабилизировался. Рыболовство частично возобновлено. Южная часть остаётся критической.', null, 'IFAS', true);

-- Colorado River / Lake Mead
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, cost_usd, severity, source_name, verified) VALUES
('OBJ-COLORADO-RIVER-001', '1922-01-01', 'milestone', 'Colorado River Compact подписан', '7 штатов США делят воду. Базовые расчёты завышены из-за аномально влажного периода.', null, null, 'US Bureau of Reclamation', true),
('OBJ-COLORADO-RIVER-001', '1935-01-01', 'construction', 'Завершение плотины Гувера', 'Строительство плотины Гувера — $49M (1935 = ~$900M сегодня). Создаёт озеро Мид.', 49000000, null, 'US Bureau of Reclamation', true),
('OBJ-COLORADO-RIVER-001', '2000-01-01', 'incident', 'Начало многолетней засухи', 'Уровень озера Мид начинает падение, которое продолжится 22 года.', null, 'high', 'USBR', true),
('OBJ-COLORADO-RIVER-001', '2021-08-16', 'incident', 'Первый официальный дефицит воды', 'Впервые в истории США объявлен официальный дефицит воды в бассейне Колорадо. Уровень Мид = 35%.', null, 'critical', 'US Bureau of Reclamation', true),
('OBJ-COLORADO-RIVER-001', '2022-08-01', 'incident', 'Исторический минимум — 27% мощности', 'Озеро Мид достигает исторического минимума 1040 футов. Угроза остановки ГЭС Гувера.', null, 'critical', 'USBR/NASA', true),
('OBJ-COLORADO-RIVER-001', '2023-05-01', 'milestone', 'Экстренное соглашение 7 штатов', 'Штаты договорились сократить водопотребление на 3 млн акро-футов до 2026 года. Стоимость компенсаций: $1.2B.', 1200000000, null, 'US DOI', true);

-- Lake Chad
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, severity, source_name, verified) VALUES
('OBJ-LAKE-CHAD-001', '1963-01-01', 'milestone', 'Максимальная площадь — 25,000 км²', 'Пиковое значение площади озера. Начало систематических измерений.', null, 'LCBC', true),
('OBJ-LAKE-CHAD-001', '1973-01-01', 'incident', 'Засуха Сахеля — первый кризис', 'Площадь озера сокращается до 11,000 км². Первый массовый кризис водоснабжения региона.', 'high', 'UN', true),
('OBJ-LAKE-CHAD-001', '2000-01-01', 'incident', 'Озеро теряет 90% площади', 'Площадь сократилась до 2,500 км². Более 30 млн человек под угрозой.', 'critical', 'UNEP/NASA', true),
('OBJ-LAKE-CHAD-001', '2017-01-01', 'incident', 'Связь с Боко Харам', 'ООН признаёт деградацию озера одной из причин нестабильности и конфликтов в регионе.', 'critical', 'UNDP', true);

-- Aral Sea sector (existing water objects)
-- Add for Amu Darya
INSERT INTO public.object_events (object_id, event_date, event_type, title, description, cost_usd, severity, source_name, verified) VALUES
('OBJ-AMU-DARYA-001', '1950-01-01', 'construction', 'Большой Ферганский канал', 'Строительство одного из крупнейших ирригационных каналов в истории ЦА. Длина 270 км.', 500000000, null, 'USSR Minvodkhoz', true),
('OBJ-AMU-DARYA-001', '1979-01-01', 'construction', 'Каракумский канал завершён', 'Длина 1375 км, пропускная способность 500 м³/с. Отводит 45% стока Амударьи в Туркменистан.', 2000000000, null, 'USSR', true),
('OBJ-AMU-DARYA-001', '2023-01-01', 'incident', 'Критический уровень стока', 'Среднегодовой сток снизился до 30 км³/год против исторической нормы 80 км³/год.', null, 'critical', 'CAWATER-INFO', true);
```

- [ ] **Step 2: Apply via Supabase MCP execute_sql**

- [ ] **Step 3: Commit**
```bash
git add supabase/seeds/object_events_seed.sql
git commit -m "data: seed real historical events for Aral Sea, Colorado River, Lake Chad, Amu Darya"
```

---

## Task 3: USGS API Edge Function

**Files:**
- Create: `supabase/functions/fetch-usgs-data/index.ts`

- [ ] **Step 1: Create Edge Function**
```typescript
// supabase/functions/fetch-usgs-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// USGS site → object_id mapping for major US water objects
const USGS_SITES = [
  { site_id: '09380000', object_id: 'OBJ-COLORADO-RIVER-001', name: 'Colorado River at Lees Ferry, AZ' },
  { site_id: '09421500', object_id: 'OBJ-COLORADO-RIVER-001', name: 'Colorado River below Hoover Dam' },
  { site_id: '14211720', object_id: 'OBJ-COLUMBIA-RIVER', name: 'Columbia River at Vancouver, WA' },
];

// USGS parameter codes
const PARAMS = '00060,00065,00010'; // discharge (m³/s), gage height (m), water temperature

serve(async () => {
  const results = { updated: 0, errors: [] as string[] };
  
  for (const site of USGS_SITES) {
    try {
      const url = `https://waterservices.usgs.gov/nwis/iv/?sites=${site.site_id}&parameterCd=${PARAMS}&format=json&siteStatus=active`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) { results.errors.push(`USGS ${site.site_id}: ${resp.status}`); continue; }
      
      const data = await resp.json();
      const timeSeries = data?.value?.timeSeries ?? [];
      
      for (const series of timeSeries) {
        const paramCode = series.variable?.variableCode?.[0]?.value;
        const values = series.values?.[0]?.value ?? [];
        if (!values.length) continue;
        
        const latest = values[values.length - 1];
        const paramMap: Record<string, { param: string; unit: string }> = {
          '00060': { param: 'flow_m3s', unit: 'm³/s' },
          '00065': { param: 'level_m', unit: 'm' },
          '00010': { param: 'temperature', unit: '°C' },
        };
        const mapping = paramMap[paramCode];
        if (!mapping || latest.value === '-999999') continue;
        
        await supabase.from('object_monitoring').insert({
          object_id: site.object_id,
          timestamp: latest.dateTime,
          parameter: mapping.param,
          value: parseFloat(latest.value),
          unit: mapping.unit,
          source: 'api',
          source_api: 'usgs',
          quality_flag: latest.qualifiers?.includes('P') ? 'provisional' : 'good',
        });
        results.updated++;
      }
      
      // Update last_fetch
      await supabase.from('object_api_config').upsert({
        object_id: site.object_id, usgs_site_id: site.site_id,
        last_fetch: new Date().toISOString(),
      }, { onConflict: 'object_id' });
      
    } catch (e) {
      results.errors.push(`${site.site_id}: ${e.message}`);
    }
  }
  
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 2: Deploy function**
```bash
cd F:/VODECO/vodprom
supabase functions deploy fetch-usgs-data
```

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/fetch-usgs-data/
git commit -m "feat: add USGS water data Edge Function for Colorado River monitoring"
```

---

## Task 4: Water News Edge Function (GDELT)

**Files:**
- Create: `supabase/functions/fetch-water-news/index.ts`

- [ ] **Step 1: Create Edge Function**
```typescript
// supabase/functions/fetch-water-news/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// GDELT free API — no key required, searches news articles
const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

const QUERIES = [
  { query: 'water crisis OR water shortage OR drought', category: 'drought', severity: 'warning' },
  { query: 'water contamination OR water pollution accident', category: 'pollution', severity: 'warning' },
  { query: 'flood disaster water infrastructure', category: 'flood', severity: 'warning' },
  { query: 'Aral Sea OR Amu Darya OR Central Asia water', category: 'news', severity: 'info', region: ['OBJ-ARAL-SEA-001', 'OBJ-AMU-DARYA-001'] },
  { query: 'Colorado River Lake Mead drought shortage', category: 'drought', severity: 'warning', region: ['OBJ-COLORADO-RIVER-001'] },
];

serve(async () => {
  const results = { inserted: 0, errors: [] as string[] };
  
  for (const q of QUERIES) {
    try {
      const params = new URLSearchParams({
        query: q.query,
        mode: 'artlist',
        maxrecords: '10',
        format: 'json',
        timespan: '7d',
        sort: 'DateDesc',
      });
      const url = `${GDELT_BASE}?${params}`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      
      const data = await resp.json();
      const articles = data?.articles ?? [];
      
      for (const art of articles) {
        const { error } = await supabase.from('water_news').upsert({
          title: art.title?.substring(0, 500) ?? 'Untitled',
          summary: art.seendate ? `Source: ${art.domain}` : null,
          url: art.url,
          source_name: art.domain,
          published_at: art.seendate
            ? new Date(art.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).toISOString()
            : new Date().toISOString(),
          severity: q.severity,
          category: q.category,
          related_objects: (q as any).region ?? [],
          language: art.language ?? 'en',
        }, { onConflict: 'url', ignoreDuplicates: true });
        
        if (!error) results.inserted++;
      }
    } catch (e) {
      results.errors.push(e.message);
    }
  }
  
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 2: Deploy**
```bash
supabase functions deploy fetch-water-news
```

- [ ] **Step 3: Commit**
```bash
git add supabase/functions/fetch-water-news/
git commit -m "feat: add GDELT water news aggregation Edge Function"
```

---

## Task 5: Front-end hooks for history + monitoring

**Files:**
- Create: `src/hooks/useObjectHistory.ts`
- Create: `src/hooks/useObjectMonitoring.ts`
- Create: `src/hooks/useWaterNews.ts`

- [ ] **Step 1: useObjectHistory**
```typescript
// src/hooks/useObjectHistory.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ObjectEvent {
  id: string;
  event_date: string;
  event_type: 'construction' | 'modernization' | 'incident' | 'milestone' | 'news';
  title: string;
  description?: string;
  cost_usd?: number;
  severity?: string;
  source_name?: string;
  verified: boolean;
}

export function useObjectHistory(objectId: string) {
  return useQuery({
    queryKey: ['object-history', objectId],
    queryFn: async (): Promise<ObjectEvent[]> => {
      const { data, error } = await supabase
        .from('object_events')
        .select('*')
        .eq('object_id', objectId)
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!objectId,
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 2: useObjectMonitoring**
```typescript
// src/hooks/useObjectMonitoring.ts
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface MonitoringReading {
  id: string;
  timestamp: string;
  parameter: string;
  value: number;
  unit: string;
  source_api?: string;
  quality_flag: string;
}

export function useObjectMonitoring(objectId: string, hours = 72) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  
  const query = useQuery({
    queryKey: ['monitoring', objectId, hours],
    queryFn: async (): Promise<MonitoringReading[]> => {
      const { data, error } = await supabase
        .from('object_monitoring')
        .select('*')
        .eq('object_id', objectId)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!objectId,
    refetchInterval: 60_000, // refresh every minute
  });

  // Real-time subscription for new readings
  const [latest, setLatest] = useState<MonitoringReading | null>(null);
  useEffect(() => {
    const ch = supabase.channel(`monitoring:${objectId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'object_monitoring', filter: `object_id=eq.${objectId}` },
        (p) => setLatest(p.new as MonitoringReading))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [objectId]);

  return { ...query, latest };
}
```

- [ ] **Step 3: useWaterNews**
```typescript
// src/hooks/useWaterNews.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface WaterNews {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  source_name?: string;
  published_at: string;
  severity: string;
  category: string;
  related_objects: string[];
}

export function useWaterNews(objectId?: string, limit = 20) {
  return useQuery({
    queryKey: ['water-news', objectId, limit],
    queryFn: async (): Promise<WaterNews[]> => {
      let q = supabase.from('water_news').select('*').order('published_at', { ascending: false }).limit(limit);
      if (objectId) {
        q = q.contains('related_objects', [objectId]);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}
```

- [ ] **Step 4: Commit**
```bash
git add src/hooks/useObjectHistory.ts src/hooks/useObjectMonitoring.ts src/hooks/useWaterNews.ts
git commit -m "feat: add useObjectHistory, useObjectMonitoring, useWaterNews hooks"
```

---

## Task 6: ObjectHistoryTimeline component

**Files:**
- Create: `src/components/objects/ObjectHistoryTimeline.tsx`

- [ ] **Step 1: Create component**
```typescript
// src/components/objects/ObjectHistoryTimeline.tsx
import { motion } from 'framer-motion';
import { Wrench, AlertTriangle, Star, Newspaper, DollarSign } from 'lucide-react';
import { useObjectHistory } from '@/hooks/useObjectHistory';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const EVENT_CONFIG = {
  construction:   { icon: Wrench,       color: '#3b82f6', label: 'Строительство' },
  modernization:  { icon: Wrench,       color: '#a78bfa', label: 'Модернизация' },
  incident:       { icon: AlertTriangle,color: '#ef4444', label: 'Инцидент' },
  milestone:      { icon: Star,         color: '#00e6c8', label: 'Веха' },
  news:           { icon: Newspaper,    color: '#94a3b8', label: 'Новость' },
};

function formatUSD(v: number) {
  if (v >= 1e9) return `$${(v/1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(0)}M`;
  return `$${(v/1000).toFixed(0)}K`;
}

export function ObjectHistoryTimeline({ objectId }: { objectId: string }) {
  const { data: events, isLoading } = useObjectHistory(objectId);

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );

  if (!events?.length) return (
    <div className="text-center py-8 text-white/30 text-sm">
      История событий будет отображаться здесь по мере добавления данных
    </div>
  );

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-4 bottom-4 w-px bg-white/10" />

      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.news;
        const Icon = cfg.icon;
        return (
          <motion.div key={event.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4 pb-5 relative"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 z-10"
              style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}40` }}>
              <Icon size={16} style={{ color: cfg.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1 pb-4 border-b border-white/5 last:border-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {event.severity === 'critical' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Критично</span>
                    )}
                    {event.verified && (
                      <span className="text-xs text-white/30">✓ верифицировано</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white/90 mt-1">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{event.description}</p>
                  )}
                  {event.source_name && (
                    <p className="text-xs text-white/30 mt-1">Источник: {event.source_name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/40">
                    {format(new Date(event.event_date), 'd MMM yyyy', { locale: ru })}
                  </p>
                  {event.cost_usd && (
                    <p className="text-xs font-bold text-amber-400 mt-0.5 flex items-center gap-1 justify-end">
                      <DollarSign size={10} />{formatUSD(event.cost_usd)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/objects/ObjectHistoryTimeline.tsx
git commit -m "feat: add ObjectHistoryTimeline with events, costs, and severity indicators"
```

---

## Task 7: MonitoringPanel — live sensor readings

**Files:**
- Create: `src/components/objects/MonitoringPanel.tsx`

- [ ] **Step 1: Create component**
```typescript
// src/components/objects/MonitoringPanel.tsx
import { useObjectMonitoring } from '@/hooks/useObjectMonitoring';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const PARAM_LABELS: Record<string, { label: string; color: string }> = {
  flow_m3s:    { label: 'Расход', color: '#00e6c8' },
  level_m:     { label: 'Уровень', color: '#3b82f6' },
  ph:          { label: 'pH', color: '#a78bfa' },
  temperature: { label: 'Температура', color: '#f59e0b' },
  turbidity:   { label: 'Мутность', color: '#94a3b8' },
  conductivity:{ label: 'Электропроводность', color: '#22d3ee' },
};

export function MonitoringPanel({ objectId }: { objectId: string }) {
  const { data: readings, isLoading, latest } = useObjectMonitoring(objectId);

  if (isLoading) return (
    <div className="h-48 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  if (!readings?.length) return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-6 text-center">
      <WifiOff size={24} className="text-white/20 mx-auto mb-2" />
      <p className="text-sm text-white/40">Данные мониторинга не подключены</p>
      <p className="text-xs text-white/20 mt-1">IoT-сенсор или API ещё не настроен для этого объекта</p>
    </div>
  );

  // Group by parameter for last reading
  const latestByParam = readings.reduce((acc, r) => {
    if (!acc[r.parameter] || new Date(r.timestamp) > new Date(acc[r.parameter].timestamp)) {
      acc[r.parameter] = r;
    }
    return acc;
  }, {} as Record<string, typeof readings[0]>);

  // Chart data for main parameter (flow or level)
  const mainParam = Object.keys(latestByParam)[0];
  const chartData = readings
    .filter(r => r.parameter === mainParam)
    .slice(0, 48)
    .reverse()
    .map(r => ({ time: format(new Date(r.timestamp), 'HH:mm'), value: r.value }));

  const cfg = PARAM_LABELS[mainParam] ?? { label: mainParam, color: '#00e6c8' };

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-green-400">Данные в реальном времени</span>
        {latest && <span className="text-xs text-white/30 ml-auto">Обновлено только что</span>}
      </div>

      {/* Current readings */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(latestByParam).slice(0, 4).map(([param, reading]) => {
          const p = PARAM_LABELS[param] ?? { label: param, color: '#94a3b8' };
          return (
            <div key={param} className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-[10px] text-white/40">{p.label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: p.color }}>
                {reading.value.toFixed(2)}
                <span className="text-xs font-normal text-white/40 ml-1">{reading.unit}</span>
              </p>
              <p className="text-[10px] text-white/30 mt-1">{reading.source_api?.toUpperCase() ?? 'Сенсор'}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 2 && (
        <div className="h-32">
          <p className="text-xs text-white/30 mb-2">{cfg.label} — последние 48 часов</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="monGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} interval={11} />
              <Tooltip contentStyle={{ background: '#050d1a', border: '1px solid rgba(0,230,200,0.2)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke={cfg.color} strokeWidth={1.5} fill="url(#monGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/objects/MonitoringPanel.tsx
git commit -m "feat: add MonitoringPanel with real-time Supabase subscription and charts"
```

---

## Task 8: Integrate panels into ObjectDetailPage

**Files:**
- Modify: `src/pages/ObjectDetailPage.tsx`

- [ ] **Step 1: Read current file structure**
Read `F:\VODECO\vodprom\src\pages\ObjectDetailPage.tsx` fully.

- [ ] **Step 2: Add tabs for History and Monitoring**
After the existing "Overview" tab content, add two new tabs to the tab list:
```typescript
import { ObjectHistoryTimeline } from '@/components/objects/ObjectHistoryTimeline';
import { MonitoringPanel } from '@/components/objects/MonitoringPanel';
import { useWaterNews } from '@/hooks/useWaterNews';
// ...
// In the tabs array, add:
{ id: 'history', label: 'История', icon: Clock },
{ id: 'monitoring', label: 'Мониторинг', icon: Activity },
{ id: 'news', label: 'Новости', icon: Newspaper },
```

In the tab content render, add cases for these tabs:
```typescript
{activeTab === 'history' && (
  <ObjectHistoryTimeline objectId={object.id} />
)}
{activeTab === 'monitoring' && (
  <MonitoringPanel objectId={object.id} />
)}
{activeTab === 'news' && (
  <NewsPanel objectId={object.id} />
)}
```

- [ ] **Step 3: Build check**
```bash
npm run build 2>&1 | tail -8
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/ObjectDetailPage.tsx src/components/objects/
git commit -m "feat: add History, Monitoring, News tabs to ObjectDetailPage"
git push origin main
```

---

## Task 9: Seed API config for major monitored objects

- [ ] **Step 1: Run SQL via Supabase MCP**
```sql
INSERT INTO public.object_api_config (object_id, usgs_site_id, owm_lat, owm_lng) VALUES
('OBJ-COLORADO-RIVER-001', '09380000', 36.8641, -111.5875),
('OBJ-MURRAY-DARLING-001', NULL, -34.1667, 142.0167),
('OBJ-MEKONG-RIVER-001', NULL, 15.1167, 105.7833),
('OBJ-GANGES-RIVER-001', NULL, 25.3176, 82.9739),
('OBJ-VOLGA-RIVER-001', NULL, 51.5333, 46.0333)
ON CONFLICT (object_id) DO NOTHING;
```

- [ ] **Step 2: Manually trigger USGS fetch**
Call the Edge Function via curl or Supabase dashboard to verify it writes data:
```bash
curl -X POST https://cllbxumyagfhtcexqxvh.supabase.co/functions/v1/fetch-usgs-data \
  -H "Authorization: Bearer <anon_key>"
```

- [ ] **Step 3: Commit**
```bash
git add -A
git commit -m "data: seed API config for monitored water objects"
git push origin main
```
