// Genesis Engine — shared API contract (client mirror of api/genesis.ts).
// Keep in sync with the serverless function's types.

export type GenesisInputType = 'object' | 'resource' | 'initiative' | 'concept';

export type GenesisStageId =
  | 'research'
  | 'concept'
  | 'tech-selection'
  | 'teo'
  | 'studio'
  | 'assembly';

export interface GenesisRequestBody {
  input_type: GenesisInputType;
  title: string;
  description: string;
  run_id?: string;
  user_id?: string | null;
}

export interface GenesisStageResult {
  stage: GenesisStageId;
  ok: boolean;
  model: string;
  duration_ms: number;
  data: any;
  error?: string;
}

export interface GenesisProject {
  title: string;
  summary: string;
  teo: any;
  studio_html: string;
}

export type GenesisErrorCode = 'NO_KEYS' | 'BAD_REQUEST' | 'UPSTREAM' | 'INTERNAL';

export interface GenesisResponse {
  ok: boolean;
  run_id: string | null;
  stages: GenesisStageResult[];
  project: GenesisProject | null;
  token_cost: number;
  error?: string;
  error_code?: GenesisErrorCode;
}

// Pipeline stage definitions for the UI progress feed.
export const GENESIS_STAGES: {
  id: GenesisStageId;
  labelKey: string;
  model: 'flash' | 'pro';
}[] = [
  { id: 'research', labelKey: 'genesis.stage_research', model: 'flash' },
  { id: 'concept', labelKey: 'genesis.stage_concept', model: 'flash' },
  { id: 'tech-selection', labelKey: 'genesis.stage_tech', model: 'flash' },
  { id: 'teo', labelKey: 'genesis.stage_teo', model: 'pro' },
  { id: 'studio', labelKey: 'genesis.stage_studio', model: 'pro' },
  { id: 'assembly', labelKey: 'genesis.stage_assembly', model: 'pro' },
];

export const GENESIS_INPUT_TYPES: { id: GenesisInputType; labelKey: string; icon: string }[] = [
  { id: 'object', labelKey: 'genesis.input_object', icon: 'Building2' },
  { id: 'resource', labelKey: 'genesis.input_resource', icon: 'Droplets' },
  { id: 'initiative', labelKey: 'genesis.input_initiative', icon: 'Rocket' },
  { id: 'concept', labelKey: 'genesis.input_concept', icon: 'Lightbulb' },
];
