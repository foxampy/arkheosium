import type { FullObjectData } from '@/types/object-full';
import { charvakoyeObject } from '../charvakoye-object';
import { uzObjects } from './uz-objects';
import { regionalObjects } from './regional-objects';

export const ALL_FULL_OBJECTS: FullObjectData[] = [
  charvakoyeObject,
  ...uzObjects,
  ...regionalObjects,
];

export const EXTENDED_OBJECTS_MAP: Record<string, FullObjectData> = Object.fromEntries(
  ALL_FULL_OBJECTS.map(o => [o.id, o])
);
