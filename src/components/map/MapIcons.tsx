/**
 * Premium minimal dot markers for MapLibre GL.
 * Small glowing circles — clean, elegant, no SVG clutter.
 */

// Default sizes
export const MARKER_SIZE_NORMAL = 10;
export const MARKER_SIZE_HIGHLIGHTED = 14;

/**
 * Creates an HTML element for use as a MapLibre custom marker.
 * Renders as a small premium glowing dot.
 *
 * @param type - Entity type key (unused for styling now, kept for API compat)
 * @param color - Fill color (hex or any CSS color)
 * @param size  - Dot diameter in pixels (default 10)
 */
export function createMarkerElement(
  type: string,
  color: string,
  size: number = MARKER_SIZE_NORMAL,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'wm-marker';
  // NB: must be `absolute` (not relative). MapLibre positions each marker via an
  // inline `transform`, relying on its own `.maplibregl-marker { position:absolute }`
  // rule. An inline `position:relative` here overrides that class, dropping every
  // marker into normal document flow — markers then cascade downward and drift off
  // their true coordinates (and many scroll off-screen). Keep this absolute.
  wrapper.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${size}px;
    height: ${size}px;
    cursor: pointer;
    pointer-events: auto;
  `;

  const glow = size < 12 ? `0 0 ${size + 4}px ${color}55` : `0 0 ${size + 6}px ${color}66`;
  const shadow = `0 1px 4px rgba(0,0,0,0.65)`;

  const dot = document.createElement('div');
  dot.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    border: 1.5px solid rgba(255,255,255,0.88);
    box-shadow: ${glow}, ${shadow};
    box-sizing: border-box;
    transition: transform 0.13s ease, box-shadow 0.13s ease;
    will-change: transform;
  `;

  wrapper.appendChild(dot);

  wrapper.addEventListener('mouseenter', () => {
    dot.style.transform = 'scale(1.55)';
    dot.style.boxShadow = `0 0 ${(size + 4) * 2}px ${color}99, 0 0 ${size + 4}px ${color}66, 0 2px 8px rgba(0,0,0,0.7)`;
  });
  wrapper.addEventListener('mouseleave', () => {
    dot.style.transform = 'scale(1)';
    dot.style.boxShadow = `${glow}, ${shadow}`;
  });

  return wrapper;
}

/**
 * Чип географической группы: название места и разбивка по доменам.
 *
 * Заменяет кружок с числом. Кружок сообщал только «здесь много всего»: чтобы
 * узнать, что именно и где, надо было приблизить. Название области и значки
 * доменов читаются сразу, без клика.
 */
export function createRegionChipElement(
  label: string,
  breakdown: ReadonlyArray<{ emoji: string; color: string; count: number }>,
  accent: string,
  total: number,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'wm-region-chip';
  // Абсолютное позиционирование обязательно: MapLibre двигает узел маркера
  // инлайновым transform — как и в createMarkerElement.
  wrapper.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
    pointer-events: auto;
  `;

  const chip = document.createElement('div');
  chip.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 5px 9px;
    border-radius: 11px;
    background: rgba(0, 8, 24, 0.88);
    border: 1.5px solid ${accent}80;
    box-shadow: 0 0 16px ${accent}40, 0 2px 8px rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    white-space: nowrap;
    transform: translate(-50%, -50%);
    transition: transform 0.13s ease, box-shadow 0.13s ease;
    will-change: transform;
    font-family: Inter, system-ui, sans-serif;
  `;

  const title = document.createElement('div');
  title.style.cssText = `
    font-size: 11px;
    font-weight: 700;
    color: #f8fafc;
    line-height: 1.15;
  `;
  title.textContent = `${label} · ${total > 999 ? '999+' : total}`;
  chip.appendChild(title);

  const row = document.createElement('div');
  row.style.cssText = 'display:flex; gap:6px; align-items:center;';
  // Больше четырёх доменов в строке не помещается, не ломая ширину чипа.
  for (const d of breakdown.slice(0, 4)) {
    const span = document.createElement('span');
    span.style.cssText = `font-size:10px; font-weight:600; color:${d.color};`;
    span.textContent = `${d.emoji} ${d.count}`;
    row.appendChild(span);
  }
  if (row.childElementCount > 0) chip.appendChild(row);

  wrapper.appendChild(chip);

  wrapper.addEventListener('mouseenter', () => {
    chip.style.transform = 'translate(-50%, -50%) scale(1.07)';
    chip.style.boxShadow = `0 0 24px ${accent}70, 0 2px 10px rgba(0,0,0,0.6)`;
  });
  wrapper.addEventListener('mouseleave', () => {
    chip.style.transform = 'translate(-50%, -50%) scale(1)';
    chip.style.boxShadow = `0 0 16px ${accent}40, 0 2px 8px rgba(0,0,0,0.55)`;
  });

  return wrapper;
}

/**
 * Returns a CSS color string for a given entity type.
 * Used when building markers without a pre-computed color.
 */
export function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    dam: '#818cf8',
    reservoir: '#60a5fa',
    hydroelectric_reservoir: '#818cf8',
    irrigation_canal: '#38bdf8',
    pumping_station: '#00e6c8',
    water_treatment_facility: '#00b4ff',
    mountain_lake: '#34d399',
    lake_crisis: '#ff4d6d',
    river: '#38bdf8',
    glacier: '#a5f3fc',
    subject: '#fbbf24',
    project: '#60a5fa',
    completed: '#22c55e',
  };
  return map[type] ?? '#22d3ee';
}

/**
 * Legacy — kept for backward compatibility only.
 * Prefer createMarkerElement() directly.
 */
export function getMarkerIcon(type: string, color: string, size: number = 10): string {
  // Returns a tiny colored circle as SVG data URL (fallback only)
  const r = size / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${r}" cy="${r}" r="${r - 1}" fill="${color}" stroke="white" stroke-width="1.5"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
