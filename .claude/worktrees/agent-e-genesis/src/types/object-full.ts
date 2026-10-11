// ═══════════════════════════════════════════════════════════════
//  FullObjectData — Complete water infrastructure object model
//  Used by: object detail pages, creator dashboard, agent mode
// ═══════════════════════════════════════════════════════════════

export type ObjectType =
  | 'dam' | 'reservoir' | 'irrigation_canal' | 'pumping_station'
  | 'water_treatment_facility' | 'mountain_lake' | 'pipeline'
  | 'wastewater_plant' | 'desalination_plant' | 'groundwater_well';

export type ObjectStatus =
  | 'operational' | 'degraded' | 'critical' | 'offline' | 'under_construction';

export type IssueUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface ObjectPhoto {
  url: string;
  caption_ru?: string;
  type: 'exterior' | 'interior' | 'aerial' | 'technical' | 'problem';
  taken_at?: string;
}

export interface ObjectDocument {
  id: string;
  title: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'image';
  url: string;           // download URL
  preview_url?: string;  // inline viewer URL (for PDFs)
  size_kb?: number;
  date?: string;
  category?: 'technical' | 'financial' | 'environmental' | 'legal' | 'other';
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ServiceZone {
  name: string;
  type: 'city' | 'district' | 'industrial' | 'agricultural';
  population?: number;
  area_km2?: number;
  water_demand_m3_per_day?: number;
}

export interface CriticalIssue {
  id: string;
  type: 'structural' | 'mechanical' | 'water_quality' | 'capacity' | 'ecological';
  description_ru: string;
  urgency: IssueUrgency;
  affected_population?: number;
  estimated_fix_cost_usd?: number;
  detected_year?: number;
}

export interface FailureEvent {
  date: string;
  type_ru: string;
  duration_hours: number;
  affected_population: number;
  cause_ru: string;
  loss_m3?: number;
}

export interface ModernizationPhase {
  id: string;
  name_ru: string;
  priority: 1 | 2 | 3;
  cost_usd: number;
  duration_months: number;
  capacity_gain_m3_per_day?: number;
  efficiency_gain_pct?: number;
  loss_reduction_pct?: number;
  co2_reduction_pct?: number;
  energy_reduction_pct?: number;
  description_ru: string;
  technologies: string[];
}

export interface YearlyProjection {
  year: number;
  revenue_usd: number;
  opex_usd: number;
  net_profit_usd: number;
  capacity_util_pct: number;
  note?: string;
}

export interface ModernizationPlan {
  total_investment_usd: number;
  phases: ModernizationPhase[];
  expected_capacity_m3_per_day: number;
  expected_loss_reduction_pct: number;
  expected_efficiency_gain_pct: number;
  expected_energy_reduction_pct?: number;
  construction_start_year?: number;
  commissioning_year?: number;
  notes_ru?: string;
}

export interface SocialImpact {
  people_gaining_water: number;
  jobs_construction: number;
  jobs_permanent: number;
  water_diseases_reduction_pct: number;
  co2_reduction_kg_per_year: number;
  gdp_multiplier_usd?: number;
}

export interface InvestmentProposal {
  total_usd: number;
  irr_pct: number;
  payback_years: number;
  npv_usd?: number;
  equity_pct: number;
  debt_pct: number;
  grant_pct?: number;
  avg_annual_revenue_usd: number;
  avg_annual_profit_usd: number;
  margin_pct: number;
  horizon_years: number;
  yearly_projections: YearlyProjection[];
  social_impact: SocialImpact;
  funding_sources?: Array<{ name: string; type: 'equity' | 'debt' | 'grant'; amount_usd: number }>;
}

export interface FullObjectData {
  // ─── Core Identity ───────────────────────────────────────────
  id: string;
  name_ru: string;
  name_en?: string;
  type: ObjectType;
  status: ObjectStatus;
  description_ru: string;
  description_en?: string;
  decree?: string;               // government decree if applicable

  // ─── Location ────────────────────────────────────────────────
  region: string;
  country: string;
  coordinates?: GeoPoint;
  coordinates_start?: GeoPoint;
  coordinates_end?: GeoPoint;
  address?: string;
  basin?: string;                // river basin name

  // ─── Technical Specifications ────────────────────────────────
  construction_year?: number;
  last_renovation_year?: number;
  design_capacity_m3_per_day?: number;
  actual_capacity_m3_per_day?: number;
  total_volume_m3?: number;      // reservoir total volume
  useful_volume_m3?: number;     // usable reservoir volume
  pipeline_length_km?: number;
  pipeline_diameter_mm?: number;
  pump_stations_count?: number;
  total_pump_power_kw?: number;
  automation_level_pct?: number; // 0–100
  wear_pct?: number;             // 0–100 equipment wear
  treatment_technologies?: string[];
  dam_height_m?: number;
  dam_length_m?: number;
  catchment_area_km2?: number;

  // ─── Water Source & Flow ──────────────────────────────────────
  water_source_type?: 'river' | 'groundwater' | 'reservoir' | 'mixed';
  water_source_name?: string;
  water_intake_point?: GeoPoint;
  water_return_point?: GeoPoint;
  water_return_method?: string;
  annual_water_intake_m3?: number;
  water_source_rivers?: string[];  // tributaries

  // ─── Ecological Indicators ───────────────────────────────────
  water_loss_pct?: number;          // % lost in distribution
  energy_kwh_per_m3?: number;       // energy intensity
  co2_kg_per_year?: number;
  quality_index?: number;           // 0–100 (WHO standard = 85+)
  meets_who_standards?: boolean;
  ph_level?: number;
  turbidity_ntu?: number;
  nitrate_mg_per_l?: number;

  // ─── Service Zones & Population ──────────────────────────────
  serves_population?: number;
  service_area_km2?: number;
  service_zones?: ServiceZone[];
  connected_object_ids?: string[];  // IDs of connected objects
  unserved_population?: number;     // people currently NOT served
  daily_water_deficit_m3?: number;

  // ─── Problems & Failure History ──────────────────────────────
  critical_issues?: CriticalIssue[];
  failure_history?: FailureEvent[];

  // ─── Financial Data ──────────────────────────────────────────
  book_value_usd?: number;
  replacement_cost_usd?: number;
  annual_opex_usd?: number;
  annual_revenue_usd?: number;
  tariff_usd_per_m3?: number;
  subsidy_pct?: number;             // % of cost covered by subsidies

  // ─── Modernization & Investment ──────────────────────────────
  modernization_plan?: ModernizationPlan;
  investment_proposal?: InvestmentProposal;

  // ─── Media ───────────────────────────────────────────────────
  photos?: ObjectPhoto[];
  cover_image_url?: string;
  video_url?: string;
  documents?: ObjectDocument[];

  // ─── Metadata ────────────────────────────────────────────────
  data_sources?: string[];          // URLs or names of data sources used
  last_updated?: string;            // ISO date
  completion_pct?: number;          // 0–100, data completeness
  tags?: string[];
}
