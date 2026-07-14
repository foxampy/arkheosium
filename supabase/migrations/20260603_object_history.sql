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

CREATE INDEX IF NOT EXISTS idx_object_events_object_id ON public.object_events(object_id);
CREATE INDEX IF NOT EXISTS idx_object_events_date ON public.object_events(event_date DESC);

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

CREATE INDEX IF NOT EXISTS idx_monitoring_object_time ON public.object_monitoring(object_id, timestamp DESC);

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

CREATE INDEX IF NOT EXISTS idx_water_news_published ON public.water_news(published_at DESC);

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='object_events' AND policyname='Public read object_events') THEN
    CREATE POLICY "Public read object_events" ON public.object_events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='object_monitoring' AND policyname='Public read monitoring') THEN
    CREATE POLICY "Public read monitoring" ON public.object_monitoring FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='water_news' AND policyname='Public read water_news') THEN
    CREATE POLICY "Public read water_news" ON public.water_news FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='water_alerts' AND policyname='Public read water_alerts') THEN
    CREATE POLICY "Public read water_alerts" ON public.water_alerts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='object_api_config' AND policyname='Public read api_config') THEN
    CREATE POLICY "Public read api_config" ON public.object_api_config FOR SELECT USING (true);
  END IF;
END $$;
