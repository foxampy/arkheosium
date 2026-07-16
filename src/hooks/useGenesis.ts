import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  GenesisRequestBody,
  GenesisResponse,
  GenesisStageId,
} from '@/lib/genesisTypes';
import { GENESIS_STAGES } from '@/lib/genesisTypes';

export type StageStatus = 'pending' | 'running' | 'done' | 'error';

export interface StageState {
  id: GenesisStageId;
  status: StageStatus;
  durationMs?: number;
  error?: string;
}

interface GenesisState {
  loading: boolean;
  stages: StageState[];
  result: GenesisResponse | null;
  error: string | null;
  errorCode: GenesisResponse['error_code'] | null;
}

const initialStages = (): StageState[] =>
  GENESIS_STAGES.map((s) => ({ id: s.id, status: 'pending' as StageStatus }));

/**
 * Drives the Genesis pipeline. The serverless function returns all stages in one
 * response; to make the agent work visible, we advance a simulated "running"
 * cursor while the request is in flight, then reconcile with real results.
 */
export function useGenesis() {
  const [state, setState] = useState<GenesisState>({
    loading: false,
    stages: initialStages(),
    result: null,
    error: null,
    errorCode: null,
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(async (input: Omit<GenesisRequestBody, 'user_id'>) => {
    clearTimers();
    setState({
      loading: true,
      stages: initialStages().map((s, i) => (i === 0 ? { ...s, status: 'running' } : s)),
      result: null,
      error: null,
      errorCode: null,
    });

    // Optimistic progress cursor — mark stages running one after another so the
    // UI shows the agents working. Real results overwrite this on completion.
    GENESIS_STAGES.forEach((_, i) => {
      const t = setTimeout(() => {
        setState((prev) => {
          if (!prev.loading) return prev;
          const stages = prev.stages.map((s, j) => {
            if (j < i) return s.status === 'running' ? { ...s, status: 'done' as StageStatus } : s;
            if (j === i) return { ...s, status: 'running' as StageStatus };
            return s;
          });
          return { ...prev, stages };
        });
      }, i * 2500);
      timers.current.push(t);
    });

    let user_id: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      user_id = data.user?.id ?? null;
    } catch {
      /* anon is fine */
    }

    try {
      const res = await fetch('/api/genesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, user_id } as GenesisRequestBody),
      });
      const json = (await res.json()) as GenesisResponse;
      clearTimers();

      // Reconcile UI stages with the real per-stage results.
      const byStage = new Map(json.stages.map((s) => [s.stage, s]));
      const stages: StageState[] = GENESIS_STAGES.map((s) => {
        const r = byStage.get(s.id);
        if (!r) return { id: s.id, status: 'pending' as StageStatus };
        return {
          id: s.id,
          status: (r.ok ? 'done' : 'error') as StageStatus,
          durationMs: r.duration_ms,
          error: r.error,
        };
      });

      setState({
        loading: false,
        stages,
        result: json,
        error: json.ok ? null : json.error ?? 'Ошибка генерации',
        errorCode: json.error_code ?? null,
      });
      return json;
    } catch (err) {
      clearTimers();
      const msg = err instanceof Error ? err.message : 'Сетевая ошибка';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
        errorCode: 'INTERNAL',
        stages: prev.stages.map((s) => (s.status === 'running' ? { ...s, status: 'error' } : s)),
      }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setState({ loading: false, stages: initialStages(), result: null, error: null, errorCode: null });
  }, []);

  return { ...state, run, reset };
}
