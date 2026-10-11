-- supabase/migrations/20260603_dashboard_layouts.sql
CREATE TABLE IF NOT EXISTS public.user_dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  layout_name TEXT DEFAULT 'default',
  layout_json JSONB NOT NULL DEFAULT '[]',
  widget_configs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, layout_name)
);

ALTER TABLE public.user_dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own layouts" ON public.user_dashboard_layouts
  FOR ALL USING (auth.uid() = user_id);
