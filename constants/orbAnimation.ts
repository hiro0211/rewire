/**
 * Tap animation constants for AnimatedOrb.
 * Tuning-friendly: all timing, spring, and visual parameters in one place.
 */
export const ORB_TAP = {
  /** Scale when pressed in (slight shrink) */
  pressInScale: 0.92,
  /** Duration of press-in shrink (ms) */
  pressInDuration: 120,
  /** Spring config for elastic bounce-back on release */
  spring: { damping: 8, stiffness: 300, mass: 0.8 },
  /** Duration of glow fade-in on press (ms) */
  glowFadeInDuration: 120,
  /** Duration of glow fade-out on release (ms) */
  glowFadeOutDuration: 400,
  /** Glow boost amount for shader inner glow (0-1 range) */
  glowBoostAmount: 0.3,
  /** Final scale of ripple ring */
  rippleScale: 2.0,
  /** Duration of ripple expansion (ms) */
  rippleDuration: 500,
  /** Initial opacity of ripple ring */
  rippleInitialOpacity: 0.6,
} as const;
