// ═══════════════════════════════════════════════════════════════
//  EntityDetail — unified type definitions for all 7 entity types
//  Used by: EntityDetailLayout + per-type configs
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from 'react';

export interface EntityKPI {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface EntityData {
  id: string;
  title: string;
  type: 'project' | 'object' | 'subject' | 'rd' | 'solution' | 'contest' | 'hackathon';
  status: string;
  coverImage?: string;
  description: string;
  location?: { lat: number; lng: number; address: string };
  kpis: EntityKPI[];
  documents: { name: string; url: string; size?: string }[];
  related?: { type: EntityData['type']; id: string; title: string }[];
  // type-specific data goes into `extra`
  extra?: Record<string, any>;
  // Optional dorozhnaya karta (roadmap) — пока заполняется только для project-типа
  roadmap?: RoadmapItem[];
}

// ═══════════════════════════════════════════════════════════════
//  Roadmap — дорожная карта оптимальной разработки проекта/портфеля
//  See: docs/superpowers/specs/2026-05-21-central-asia-pilot-detailed-design.md §6
// ═══════════════════════════════════════════════════════════════

export type RoadmapPriority = 'critical' | 'high' | 'medium' | 'optional';
export type RoadmapPhase = 'phase-1' | 'phase-2' | 'phase-3' | 'long-term';
export type RoadmapItemType =
  | 'modernisation'
  | 'reconstruction'
  | 'new_build'
  | 'process_change'
  | 'research';
export type RoadmapItemStatus = 'planned' | 'in-progress' | 'completed' | 'blocked';

export interface Technology {
  name: string;
  description?: string;
  vendor?: string;
  trl?: number; // 1-9
  cost?: number;
}

export interface Equipment {
  name: string;
  type: string;
  manufacturer?: string;
  quantity: number;
  unitCost?: number;
  specs?: Record<string, string>;
}

export interface Innovation {
  name: string;
  description?: string;
  patent?: string;
}

export interface NewObjectSpec {
  type: string;
  name: string;
  approximateCoords?: { lat: number; lng: number };
}

export interface Risk {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
}

export interface RoadmapKpiImpact {
  kpi: string;
  delta: string; // e.g. "↑ 15%" or "↓ 25%"
}

export interface RoadmapReference {
  url: string;
  title: string;
}

export interface RoadmapItem {
  id: string;
  priority: RoadmapPriority;
  phase: RoadmapPhase;
  title: string;
  shortDesc: string;
  longDesc: string;
  type: RoadmapItemType;
  targetObjects?: string[]; // existing object IDs we modify
  newObjects?: NewObjectSpec[]; // new builds
  technologies?: Technology[];
  equipment?: Equipment[];
  innovations?: Innovation[];
  budget?: { amount: number; currency: string };
  duration?: { months: number };
  workforce?: { engineers?: number; workers?: number };
  dependsOn?: string[]; // other roadmap item IDs
  unblocks?: string[];
  expectedKpiImpact?: RoadmapKpiImpact[];
  risks?: Risk[];
  rationale: string;
  references?: RoadmapReference[];
  status: RoadmapItemStatus;
}

export interface EntityTypeConfig {
  typeKey: EntityData['type'];
  label: string;          // "Проект"
  pluralLabel: string;    // "Проекты"
  color: string;          // accent
  // Renders the type-specific section(s) below common sections
  renderTypeSpecific: (data: EntityData) => ReactNode;
  // Fetches/loads data for given id; for MVP returns static fixture
  loadData: (id: string) => EntityData | null;
}
