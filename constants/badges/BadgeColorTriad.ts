export type HexColor = `#${string}`;

export interface BadgeColorTriad {
  readonly core: HexColor;
  readonly glow: HexColor;
  readonly accent: HexColor;
}
