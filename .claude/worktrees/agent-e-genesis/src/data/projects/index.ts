import { shirinProject } from './shirin';
import type { ProjectData } from './types';

export const PROJECTS_REGISTRY: Record<string, ProjectData> = {
  shirin: shirinProject,
};

export { shirinProject };
export type { ProjectData };
