import { useEffect, useRef } from 'react';

/**
 * NetworkMeshBackground
 * A lightweight animated "spiderweb" / graph-mesh background rendered on a
 * single <canvas>. Semi-transparent cyan/teal nodes drift in gentle waves and
 * connect with lines when they are near each other.
 *
 * - Performant: node count is capped and scaled to viewport area, DPR is
 *   clamped, and the animation pauses when the tab is hidden.
 * - Respects prefers-reduced-motion (renders a single near-static frame).
 * - Sits BEHIND content (fixed, pointer-events:none, low z-index).
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

const ACCENT = '0, 230, 200'; // #00e6c8 as rgb triplet

export default function NetworkMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let rafId = 0;
    let running = true;
    let connectDist = 150;
    let connectDist2 = connectDist * connectDist;

    function buildNodes() {
      // ~1 node per 18k px², capped for performance.
      const area = width * height;
      const count = Math.max(24, Math.min(90, Math.round(area / 18000)));
      connectDist = Math.min(180, Math.max(120, Math.sqrt(area) / 9));
      connectDist2 = connectDist * connectDist;
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!reduceMotion) {
          // Wave drift: base velocity + subtle sinusoidal sway.
          n.x += n.vx + Math.sin(t * 0.0004 + n.phase) * 0.12;
          n.y += n.vy + Math.cos(t * 0.0004 + n.phase) * 0.12;

          // Wrap around edges for a seamless field.
          if (n.x < -20) n.x = width + 20;
          else if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          else if (n.y > height + 20) n.y = -20;
        }
      }

      // Connecting threads.
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < connectDist2) {
            const alpha = (1 - d2 / connectDist2) * 0.32;
            ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.fillStyle = `rgba(${ACCENT}, 0.55)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running && !reduceMotion) {
        rafId = requestAnimationFrame(draw);
      }
    }

    function start() {
      if (reduceMotion) {
        draw(0);
        return;
      }
      running = true;
      rafId = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    resize();
    start();

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
}
