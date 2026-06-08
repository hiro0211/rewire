import type { BadgeId } from '@/constants/badges/BadgeId';
import type { PlanetBadgeId } from '@/constants/planets/planetTextureMap';

export interface PlanetShaderConfig {
  cloudOpacity: number;
  atmosphereColor: readonly [number, number, number];
  emissive: number;
  rotationSpeed: number;
}

export const DEFAULT_PLANET_SHADER_CONFIG: PlanetShaderConfig = {
  cloudOpacity: 0,
  atmosphereColor: [0.35, 0.65, 1.0],
  emissive: 0,
  rotationSpeed: 0.06,
};

export const PLANET_SHADER_CONFIG: Record<PlanetBadgeId, PlanetShaderConfig> = {
  mercury: { cloudOpacity: 0,    atmosphereColor: [0.85, 0.85, 0.85], emissive: 0, rotationSpeed: 0.04 },
  venus:   { cloudOpacity: 0.55, atmosphereColor: [1.0,  0.85, 0.55], emissive: 0, rotationSpeed: 0.02 },
  earth:   { cloudOpacity: 0.35, atmosphereColor: [0.35, 0.65, 1.0 ], emissive: 0, rotationSpeed: 0.08 },
  mars:    { cloudOpacity: 0,    atmosphereColor: [1.0,  0.55, 0.35], emissive: 0, rotationSpeed: 0.07 },
  jupiter: { cloudOpacity: 0.20, atmosphereColor: [0.85, 0.75, 0.55], emissive: 0, rotationSpeed: 0.12 },
  saturn:  { cloudOpacity: 0.18, atmosphereColor: [0.95, 0.85, 0.55], emissive: 0, rotationSpeed: 0.10 },
  uranus:  { cloudOpacity: 0.10, atmosphereColor: [0.55, 0.85, 0.95], emissive: 0, rotationSpeed: 0.06 },
  neptune: { cloudOpacity: 0.15, atmosphereColor: [0.35, 0.50, 0.95], emissive: 0, rotationSpeed: 0.06 },
  moon:    { cloudOpacity: 0,    atmosphereColor: [0.7,  0.7,  0.7 ], emissive: 0, rotationSpeed: 0.03 },
  sun:     { cloudOpacity: 0,    atmosphereColor: [1.0,  0.85, 0.4 ], emissive: 1, rotationSpeed: 0.15 },
};

export function getPlanetShaderConfig(badgeId: BadgeId | undefined): PlanetShaderConfig {
  if (!badgeId) return DEFAULT_PLANET_SHADER_CONFIG;
  const cfg = (PLANET_SHADER_CONFIG as Record<string, PlanetShaderConfig>)[badgeId];
  return cfg ?? DEFAULT_PLANET_SHADER_CONFIG;
}
