export type HexColor = `#${string}`;

export interface BadgeColorTriad {
  readonly core: HexColor;
  readonly mid: HexColor;
  readonly outer: HexColor;
  readonly glow: HexColor;
}
