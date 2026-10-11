// Simplified types for VODPROM SPA (no Drizzle ORM)
export interface WaterResource {
  id: number;
  name: string;
  nameRu?: string;
  type: string;
  lat: number;
  lng: number;
  description?: string;
  region?: string;
  status?: string;
  capacity?: number;
  currentLevel?: number;
}
