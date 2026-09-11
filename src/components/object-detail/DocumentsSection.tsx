import { useState } from 'react';
import { FileText, Download, Eye, X, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FullObjectData, ObjectDocument } from '@/types/object-full';

/**
 * Здесь стоял DEMO_DOCS — набор из пяти документов «Чарвакского
 * водохранилища» (технический паспорт, отчёт экологической экспертизы,
 * инвестиционный меморандум, финансовая модель, акт состояния
 * инфраструктуры) с размерами в килобайтах, датами и url: '#'. Он
 * подставлялся ЛЮБОМУ объекту, у которого нет документов, — то есть каждый
 * объект платформы выглядел документированным, а ссылки никуда не вели.
 *
 * Набор удалён. Если у объекта нет документов, так и написано: ноль.
 */
const DEMO_DOCS: ObjectDocument[] = [];

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Технический',
  financial: 'Финансовый',
  environmental: 'Экологический',
  legal: 'Юридический',
  other: 'Прочее',
};

const TYPE_COLORS: Record<string, string> = {
  pdf: '#f87171',
  xlsx: '#4ade80',
  docx: '#60a5fa',
  image: '#fbbf24',
};

function DocIcon({ type }: { type: string }) {
  if (type === 'xlsx') return <FileSpreadsheet size={18} style={{ color: '#4ade80' }} />;
  return <FileText size={18} style={{ color: TYPE_COLORS[type] ?? '#fff' }} />;
}

export default function DocumentsSection({ object }: { object: FullObjectData }) {
  const docs =
    object.documents && object.documents.length > 0 ? object.documents : DEMO_DOCS;
  const [viewerDoc, setViewerDoc] = useState<ObjectDocument | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    'all',
    ...Array.from(new Set(docs.map((d) => d.category ?? 'other'))),
  ];
  const filtered =
    activeCategory === 'all'
      ? docs
      : docs.filter((d) => (d.category ?? 'other') === activeCategory);

  return (
    <div className="space-y-4">
      {/* Header + category filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          <span className="text-white/80 font-semibold">Документация</span>
          <span className="text-white/35 text-xs">({docs.length} файлов)</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={
                activeCategory === cat
                  ? {
                      background: 'rgba(96,165,250,0.2)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96,165,250,0.3)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {cat === 'all' ? 'Все' : CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)' }}
          >
            <p className="text-white/60 text-sm">
              Документов по объекту — <span className="text-white/80 font-semibold">ноль</span>.
            </p>
            <p className="text-white/40 text-xs leading-relaxed mt-2">
              Раньше сюда подставлялся демонстрационный набор — техпаспорт,
              экологическая экспертиза, инвестиционный меморандум, финансовая
              модель — одинаковый для любого объекта, со ссылками в никуда. Он
              убран: документ появится здесь, только когда будет получен, с
              источником и проверяемой ссылкой.
            </p>
          </div>
        )}
        {filtered.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl transition-all group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${TYPE_COLORS[doc.type] ?? '#fff'}12` }}
            >
              <DocIcon type={doc.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/85 text-sm font-medium truncate">{doc.title}</div>
              <div className="flex items-center gap-2 text-xs text-white/35 mt-0.5">
                {doc.date && <span>{doc.date}</span>}
                {doc.size_kb && (
                  <span>
                    {doc.size_kb > 1024
                      ? `${(doc.size_kb / 1024).toFixed(1)} MB`
                      : `${doc.size_kb} KB`}
                  </span>
                )}
                {doc.category && (
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {CATEGORY_LABELS[doc.category] ?? doc.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {doc.preview_url && doc.type === 'pdf' && (
                <button
                  onClick={() => setViewerDoc(doc)}
                  title="Открыть"
                  className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
                  style={{ color: '#60a5fa' }}
                >
                  <Eye size={15} />
                </button>
              )}
              <a
                href={doc.url}
                download
                title="Скачать"
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: '#00e6c8' }}
              >
                <Download size={15} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inline PDF viewer modal */}
      <AnimatePresence>
        {viewerDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setViewerDoc(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
              style={{
                height: '85vh',
                background: 'rgba(0,6,20,0.97)',
                border: '1px solid rgba(0,230,200,0.2)',
              }}
            >
              {/* Viewer header */}
              <div
                className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(0,230,200,0.1)' }}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-400" />
                  <span className="text-white/80 text-sm font-semibold truncate max-w-[400px]">
                    {viewerDoc.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={viewerDoc.url}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                    style={{
                      background: 'rgba(0,230,200,0.1)',
                      color: '#00e6c8',
                      border: '1px solid rgba(0,230,200,0.2)',
                    }}
                  >
                    <Download size={12} /> Скачать
                  </a>
                  <button
                    onClick={() => setViewerDoc(null)}
                    className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* PDF viewer */}
              <div className="flex-1 relative bg-gray-900">
                {viewerDoc.preview_url && viewerDoc.preview_url !== '#' ? (
                  <iframe
                    src={viewerDoc.preview_url}
                    className="w-full h-full border-none"
                    title={viewerDoc.title}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <FileText size={48} className="text-white/15" />
                    <p className="text-white/40 text-sm">
                      Предпросмотр недоступен для этого документа
                    </p>
                    <a
                      href={viewerDoc.url}
                      download
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm cursor-pointer"
                      style={{
                        background: 'rgba(0,230,200,0.1)',
                        color: '#00e6c8',
                        border: '1px solid rgba(0,230,200,0.2)',
                      }}
                    >
                      <Download size={14} /> Скачать для просмотра
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
