// ═══════════════════════════════════════════════════════════════
//  PreviewDoc — live read-only "one-pager" brief assembled from the
//  current constructor blocks. Updates as blocks change. Includes
//  export-JSON + print affordances.
// ═══════════════════════════════════════════════════════════════

import {
  Lightbulb, Cpu, DollarSign, Calendar, Users, ListChecks, Rocket, Zap, Brain,
  Boxes, TrendingUp, AlertTriangle, Sparkles, Package, Building2, Printer,
  Download, FileText,
} from 'lucide-react';
import type { LabBlock, LabMode } from '@/lib/labTypes';

const ACCENT = '#00e6c8';
const ACCENT2 = '#00d4ff';

const ICONS: Record<string, typeof Lightbulb> = {
  Lightbulb, Cpu, DollarSign, Calendar, Users, ListChecks, Rocket, Zap, Brain,
  Boxes, TrendingUp, AlertTriangle, Sparkles, Package, Building2,
};

interface Props {
  blocks: LabBlock[];
  mode: LabMode;
  modelName: string;
  onExport: () => void;
}

export default function PreviewDoc({ blocks, mode, modelName, onExport }: Props) {
  const concept = blocks.find((b) => b.id === 'concept');
  const title = concept?.content.trim().split('\n')[0].slice(0, 80) || 'Черновик без названия';
  const filled = blocks.filter((b) => b.content.trim().length > 0);
  const isEmpty = filled.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <FileText className="w-4 h-4 text-white/40" />
        <span className="text-xs text-white/50 flex-1">Живой предпросмотр брифа</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Printer className="w-3.5 h-3.5" /> Печать
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Download className="w-3.5 h-3.5" /> JSON
        </button>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div
          className="mx-auto max-w-2xl rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Header band */}
          <div
            className="px-6 py-5"
            style={{ background: `linear-gradient(135deg, ${ACCENT}18, ${ACCENT2}0a)`, borderBottom: `1px solid ${ACCENT}22` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ background: `${ACCENT}22`, color: ACCENT }}
              >
                {mode === 'product' ? 'Продукт' : 'Проект'}
              </span>
              <span className="text-[10px] text-white/35">ARKHEOSIUM · {modelName}</span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">{title}</h1>
          </div>

          {/* Sections */}
          {isEmpty ? (
            <div className="px-6 py-10 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: `${ACCENT}66` }} />
              <p className="text-sm text-white/40">
                Пока пусто. Заполните блоки конструктора или попросите ИИ — бриф соберётся автоматически.
              </p>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">
              {blocks.map((b) => {
                const content = b.content.trim();
                if (!content) return null;
                const C = ICONS[b.icon] || Package;
                return (
                  <section key={b.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}2e` }}
                      >
                        <C className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                      </div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wide">{b.title}</h2>
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/75 whitespace-pre-wrap pl-8">
                      {content}
                    </p>
                  </section>
                );
              })}
            </div>
          )}

          <div className="px-6 py-3 border-t border-white/5 text-[10px] text-white/30">
            Сформировано {new Date().toLocaleDateString('ru')} · {filled.length}/{blocks.length} разделов
          </div>
        </div>
      </div>
    </div>
  );
}
