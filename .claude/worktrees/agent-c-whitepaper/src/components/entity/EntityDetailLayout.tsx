// ═══════════════════════════════════════════════════════════════
//  EntityDetailLayout — unified detail-page template for all 7 entity types
//  Sections (in fixed order): Hero, KPIs, Map, Description,
//  type-specific (via config.renderTypeSpecific), Related, Documents, CTA
// ═══════════════════════════════════════════════════════════════

import { WaterMap } from '@/components/map/WaterMap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Mail, Handshake } from 'lucide-react';
import { Link } from 'wouter';
import type { EntityData, EntityTypeConfig } from '@/data/entity-types/types';
import { EntityChatThread } from './EntityChatThread';

interface Props {
  data: EntityData;
  config: EntityTypeConfig;
}

export function EntityDetailLayout({ data, config }: Props) {
  return (
    <div className="min-h-[calc(100vh-52px)] bg-[#0a1628] text-white">
      {/* HERO */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {data.coverImage && (
          <img
            src={data.coverImage}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1628]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <Badge
            className="w-fit"
            style={{ background: config.color, color: '#000' }}
          >
            {config.label}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mt-3">{data.title}</h1>
          {data.location && (
            <p className="text-slate-300 mt-2">{data.location.address}</p>
          )}
          <Badge variant="outline" className="mt-2 w-fit">
            {data.status}
          </Badge>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* KPIs */}
        {data.kpis.length > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.kpis.map((k, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-4"
              >
                <div className="text-xs text-slate-400 uppercase tracking-wider">
                  {k.label}
                </div>
                <div className="text-2xl font-bold mt-1">
                  {k.value}{' '}
                  {k.unit && (
                    <span className="text-sm text-slate-500 font-normal">
                      {k.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* MAP */}
        {data.location && (
          <section>
            <h2 className="text-2xl font-bold mb-4">География</h2>
            <div className="rounded-lg overflow-hidden border border-slate-800">
              <WaterMap
                center={[data.location.lng, data.location.lat]}
                zoom={9}
                height="400px"
                markers={[
                  {
                    id: data.id,
                    type: data.type,
                    lat: data.location.lat,
                    lng: data.location.lng,
                    title: data.title,
                    description: data.location.address,
                  },
                ]}
              />
            </div>
          </section>
        )}

        {/* DESCRIPTION */}
        {data.description && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Описание</h2>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
              {data.description}
            </div>
          </section>
        )}

        {/* TYPE-SPECIFIC */}
        {config.renderTypeSpecific(data)}

        {/* RELATED */}
        {data.related && data.related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Связанные сущности</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {data.related.map((r, i) => (
                <Link key={i} href={`/${r.type}s/${r.id}`}>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-cyan-500 transition-colors cursor-pointer">
                    <div className="text-xs text-cyan-400 uppercase tracking-wider">
                      {r.type}
                    </div>
                    <div className="text-lg mt-1">{r.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* DOCUMENTS */}
        {data.documents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Документы</h2>
            <div className="space-y-2">
              {data.documents.map((d, i) => (
                <a
                  key={i}
                  href={d.url}
                  download
                  className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded hover:border-cyan-500 transition-colors"
                >
                  <Download className="w-5 h-5 text-cyan-400" />
                  <span className="flex-1">{d.name}</span>
                  {d.size && (
                    <span className="text-xs text-slate-500">{d.size}</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CHAT — обсуждение под каждой сущностью */}
        <EntityChatThread entityType={data.type} entityId={data.id} />

        {/* CTA */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Заинтересованы?</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
              <Mail className="w-4 h-4 mr-2" />
              Связаться для инвестирования
            </Button>
            <Button variant="outline">
              <Handshake className="w-4 h-4 mr-2" />
              Связаться для партнёрства
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Запросить документацию
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
