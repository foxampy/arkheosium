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

    } catch (e: unknown) {
      results.errors.push(`${site.site_id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
});
