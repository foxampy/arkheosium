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
          related_objects: (q as { query: string; category: string; severity: string; region?: string[] }).region ?? [],
          language: art.language ?? 'en',
        }, { onConflict: 'url', ignoreDuplicates: true });

        if (!error) results.inserted++;
      }
    } catch (e: unknown) {
      results.errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});
