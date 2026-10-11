// ═══════════════════════════════════════════════════════════════
//  VODecology — Project Data Types
//  Generic interfaces for water infrastructure investment projects
// ═══════════════════════════════════════════════════════════════

export interface KPIStat {
  label: string;
  value: string;
  unit?: string;
  color: string;
  icon?: string; // lucide icon name
}

export interface TechParam {
  label: string;
  value: string;
  color: string;
}

export interface FinancialStat {
  label: string;
  value: string;
  color: string;
  icon?: string;
}

export interface YearlyProjection {
  year: number;
  capacity: string;       // e.g. "75%"
  revenue: number;        // $M
  costs: number;          // $M
  netProfit: number;      // $M
  note?: string;
}

export interface InvestmentItem {
  label: string;
  min: number;
  max: number;
  color: string;
  icon?: string;
}

export interface FinancialData {
  avgRevenue: string;
  avgProfit: string;
  margin: string;
  breakEven: string;
  payback: string;
  horizon: string;
  attractedPct: number;   // e.g. 80
  equityPct: number;      // e.g. 20
  attractedAmt: string;   // e.g. "~$176M"
  equityAmt: string;      // e.g. "~$44M"
  investmentBreakdown: InvestmentItem[];
  yearlyProjections: YearlyProjection[];
}

export interface PPPParty {
  name: string;
  role: string;
  share: number;          // percentage
  color: string;
  desc: string;
}

export interface PPPObligation {
  party: string;
  color: string;
  icon?: string;
  items: string[];
}

export interface PPPData {
  parties: PPPParty[];
  obligations: PPPObligation[];
}

export interface TimelineStep {
  phase: string;
  period: string;
  status: 'current' | 'upcoming' | 'planned' | 'completed';
  color: string;
  desc: string;
}

export interface TechPartner {
  category: 'design' | 'construction' | 'equipment';
  label: string;
  names: string[];
  color: string;
}

export interface BenefitItem {
  icon: string;           // lucide icon name
  value: string;
  label: string;
  sublabel?: string;
  color: string;
}

export interface BenefitsData {
  social: BenefitItem[];
  economic: BenefitItem[];
  environmental: BenefitItem[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ProblemStat {
  label: string;
  current: string;
  target: string;
  unit: string;
  color: string;
  icon: string;
}

export interface WaterProcessStep {
  step: number;
  name: string;
  desc: string;
  icon: string;
  color: string;
}

export interface ProjectLocation {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

export interface SPVData {
  type: string;
  currency: string;
  description: string;
}

export interface PartnerStat {
  label: string;
  value: string;
  color: string;
}

export interface PartnerData {
  name: string;
  fullName: string;
  address: string;
  website: string;
  email: string;
  description: string;
  stats: PartnerStat[];
}

export interface MapCityMark {
  name: string;
  lat: number;
  lng: number;
  isMain?: boolean;
  label?: string;
}

export interface MapRiverPath {
  name: string;
  color: string;
  coords: [number, number][];   // [lat, lng] pairs
}

export interface MapData {
  cities: MapCityMark[];
  rivers: MapRiverPath[];
  pipelineCoords?: [number, number][];  // [lat, lng] pairs
}

// ─── Full ProjectData ─────────────────────────────────────────

export interface ProjectData {
  id: string;
  name: string;
  subtitle: string;
  description?: string;
  decree?: string;
  status?: string;

  location: ProjectLocation;

  heroKPIs: KPIStat[];
  techParams: TechParam[];

  problemStats: ProblemStat[];

  financials: FinancialData;

  ppp: PPPData;

  timeline: TimelineStep[];

  techPartners: TechPartner[];

  benefits: BenefitsData;

  waterProcess: WaterProcessStep[];

  spv: SPVData;

  mainPartner: PartnerData;

  faq: FAQItem[];

  mapData: MapData;

  tags?: string[];
  investmentTotal?: string;
}
