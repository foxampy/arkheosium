import { useEffect, useState } from 'react';
import { loadWorldBorders, type WorldBorders } from './worldBorders';

/**
 * Атлас государственных границ. `null`, пока файл не доехал.
 *
 * Пока атласа нет, вызывающий компонент показывает объекты по отдельности —
 * это корректное промежуточное состояние, а не пустой экран: группировка
 * появится, когда появятся границы.
 */
export function useWorldBorders(): { world: WorldBorders | null; error: Error | null } {
  const [world, setWorld] = useState<WorldBorders | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    loadWorldBorders()
      .then((w) => { if (alive) setWorld(w); })
      .catch((e: Error) => {
        if (!alive) return;
        console.warn('[geo] границы не загрузились, объекты показаны по отдельности', e);
        setError(e);
      });
    return () => { alive = false; };
  }, []);

  return { world, error };
}
