import type React from 'react';

export type LayerKey =
  | 'rivers'
  | 'lakes'
  | 'glaciers'
  | 'groundwater'
  | 'scarcity'
  | 'borders'
  | 'cities'
  | 'drought'
  | 'water_quality';

export type GroupId =
  | 'aral'
  | 'central-asia-rivers'
  | 'pamir-tianshan-glaciers'
  | 'samarkand-water'
  | 'tashkent-metro'
  | 'caspian-basin'
  | 'municipal-uz';

export type EntityType = 'project' | 'object' | 'subject' | 'rd' | 'solution' | 'contest' | 'hackathon';

export interface MapMarker {
  id: string;
  type: EntityType;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  groupId?: GroupId;
  /** 'hardcoded' = from local data files, 'supabase' = fetched from DB */
  source?: 'hardcoded' | 'supabase';
  /** If true, marker gets a neon pulsing dot overlay */
  isHighlighted?: boolean;
  /** Specific object sub-type for icon selection (dam, river, pumping_station, etc.) */
  objectType?: string;
  /** Resource domain (water | energy | minerals | nature | agriculture | climate) — drives colour/legend */
  domain?: string;
}

export interface WaterMapHandle {
  flyTo: (center: [number, number], zoom: number) => void;
  updateSource: (sourceId: string, data: any) => void;
}

export interface WaterMapProps {
  center?: [number, number];
  zoom?: number;
  layers?: LayerKey[];
  highlightGroups?: GroupId[];
  /** Show project-group bbox rectangles on the map (default: false) */
  showGroups?: boolean;
  markers?: MapMarker[];
  onMarkerClick?: (m: MapMarker) => void;
  onGroupClick?: (groupId: GroupId) => void;
  /**
   * Enable proximity clustering of markers. When true, markers that are
   * geographically close are grouped into a count bubble that expands
   * (zooms in) on click. Defaults to false = render every marker directly.
   */
  cluster?: boolean;
  /**
   * Screen-space radius (px) used to group markers into a cluster.
   * Only used when `cluster` is true. Defaults to 48.
   */
  clusterRadius?: number;
  /** Called when map viewport changes — receives bounds [west, south, east, north] */
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  height?: string;
  interactive?: boolean;
  showPopups?: boolean;
  className?: string;
  /** Ref to access map methods like flyTo */
  mapRef?: React.MutableRefObject<WaterMapHandle | null>;
  /** Knowledge-graph relationship edges (GeoJSON LineStrings); rendered as a glowing web when provided. */
  graphEdges?: GeoJSON.FeatureCollection;
  /** Complex hubs (GeoJSON Points from entity_groups); rendered as glowing hub markers when provided. */
  complexes?: GeoJSON.FeatureCollection;
  /** Called when a complex hub is clicked (receives its slug). */
  onComplexClick?: (slug: string) => void;
}
