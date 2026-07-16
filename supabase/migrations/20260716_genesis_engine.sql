-- ============================================================
-- Genesis Engine — autonomous agentic project pipeline
-- Tables: genesis_runs, genesis_steps, genesis_artifacts, genesis_projects
-- Persist every request/response/artifact systematically.
-- ============================================================

-- 1) genesis_runs — one generation session
CREATE TABLE IF NOT EXISTS public.genesis_runs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable: page is open to all (demo/anon)
  input_type    TEXT NOT NULL,                    -- 'object' | 'resource' | 'initiative' | 'concept'
  input_payload JSONB NOT NULL DEFAULT '{}',      -- raw user input (title, description, params)
  status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'running' | 'done' | 'error'
  token_cost    INTEGER DEFAULT 0,                -- approx tokens consumed across agents
  error         TEXT,                             -- error message when status='error'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genesis_runs_user ON public.genesis_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_genesis_runs_created ON public.genesis_runs(created_at DESC);

-- 2) genesis_steps — per-agent stage record (prompt, response, artifact, timing)
CREATE TABLE IF NOT EXISTS public.genesis_steps (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id       UUID NOT NULL REFERENCES public.genesis_runs(id) ON DELETE CASCADE,
  stage        TEXT NOT NULL,                     -- 'research' | 'concept' | 'tech-selection' | 'teo' | 'studio' | 'assembly'
  prompt       TEXT,
  response     JSONB DEFAULT '{}',                -- structured stage result
  artifact     JSONB DEFAULT '{}',               -- optional artifact metadata produced by the stage
  model        TEXT,                             -- 'gemini-2.5-flash' | 'gemini-2.5-pro'
  duration_ms  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genesis_steps_run ON public.genesis_steps(run_id);

-- 3) genesis_artifacts — final files / visualizations / code
CREATE TABLE IF NOT EXISTS public.genesis_artifacts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id       UUID NOT NULL REFERENCES public.genesis_runs(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL,                     -- 'studio_html' | 'report_md' | 'code' | 'chart' | 'other'
  content      TEXT,                              -- inline content (e.g. sandboxed studio HTML)
  url          TEXT,                              -- external/storage URL if applicable
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genesis_artifacts_run ON public.genesis_artifacts(run_id);

-- 4) genesis_projects — published projects (link to Project Hub)
CREATE TABLE IF NOT EXISTS public.genesis_projects (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id       UUID NOT NULL REFERENCES public.genesis_runs(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  summary      TEXT,
  teo          JSONB DEFAULT '{}',                -- techno-economic feasibility (ТЭО)
  published    BOOLEAN DEFAULT FALSE,
  hub_id       TEXT,                              -- id of the created Project Hub card
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genesis_projects_run ON public.genesis_projects(run_id);
CREATE INDEX IF NOT EXISTS idx_genesis_projects_published ON public.genesis_projects(published);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.genesis_runs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_steps     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_projects  ENABLE ROW LEVEL SECURITY;

-- Helper predicate: current user is an admin (profiles.role = 'admin')
-- We inline this in policies rather than a function to match existing migration style.

DO $$
BEGIN
  -- genesis_runs: anyone (incl. anon) may create a run (page open to all).
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_runs' AND policyname='Anyone insert genesis_runs') THEN
    CREATE POLICY "Anyone insert genesis_runs" ON public.genesis_runs
      FOR INSERT WITH CHECK (true);
  END IF;

  -- genesis_runs: owner or admin may read the run.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_runs' AND policyname='Owner or admin read genesis_runs') THEN
    CREATE POLICY "Owner or admin read genesis_runs" ON public.genesis_runs
      FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;

  -- genesis_runs: owner or admin may update (status, token_cost).
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_runs' AND policyname='Owner or admin update genesis_runs') THEN
    CREATE POLICY "Owner or admin update genesis_runs" ON public.genesis_runs
      FOR UPDATE USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      );
  END IF;

  -- genesis_steps: readable by run owner or admin.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_steps' AND policyname='Owner or admin read genesis_steps') THEN
    CREATE POLICY "Owner or admin read genesis_steps" ON public.genesis_steps
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.genesis_runs r
          WHERE r.id = genesis_steps.run_id
            AND (
              r.user_id = auth.uid()
              OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
            )
        )
      );
  END IF;

  -- genesis_artifacts: readable by run owner or admin.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_artifacts' AND policyname='Owner or admin read genesis_artifacts') THEN
    CREATE POLICY "Owner or admin read genesis_artifacts" ON public.genesis_artifacts
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.genesis_runs r
          WHERE r.id = genesis_artifacts.run_id
            AND (
              r.user_id = auth.uid()
              OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
            )
        )
      );
  END IF;

  -- genesis_projects: PUBLISHED projects are publicly readable (they become Hub cards);
  -- unpublished are readable by owner/admin only.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_projects' AND policyname='Public read published genesis_projects') THEN
    CREATE POLICY "Public read published genesis_projects" ON public.genesis_projects
      FOR SELECT USING (
        published = true
        OR EXISTS (
          SELECT 1 FROM public.genesis_runs r
          WHERE r.id = genesis_projects.run_id
            AND (
              r.user_id = auth.uid()
              OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
            )
        )
      );
  END IF;

  -- genesis_projects: run owner or admin may insert / publish.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_projects' AND policyname='Owner or admin write genesis_projects') THEN
    CREATE POLICY "Owner or admin write genesis_projects" ON public.genesis_projects
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.genesis_runs r
          WHERE r.id = genesis_projects.run_id
            AND (
              r.user_id = auth.uid()
              OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
            )
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='genesis_projects' AND policyname='Owner or admin update genesis_projects') THEN
    CREATE POLICY "Owner or admin update genesis_projects" ON public.genesis_projects
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.genesis_runs r
          WHERE r.id = genesis_projects.run_id
            AND (
              r.user_id = auth.uid()
              OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
            )
        )
      );
  END IF;
END $$;

-- NOTE: The serverless function /api/genesis persists steps/artifacts using the
-- Supabase service-role key (bypasses RLS) so the autonomous pipeline can write
-- regardless of the caller. The RLS policies above govern client-side reads.
