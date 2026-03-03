import { StyleSheet } from 'react-native';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';

export const illStyles = StyleSheet.create({
  // Dopamine bars
  barsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
    marginTop: 28,
  },
  barColumn: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bar: {
    width: 36,
    borderRadius: RADIUS.sm,
  },
  barLabel: {
    fontSize: FONT_SIZE.xs,
  },
  baseline: {
    width: '80%',
    height: 1,
    marginTop: SPACING.xs,
  },

  // Lock icon
  lockContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  dotTopLeft: { top: 10, left: 10 },
  dotTopRight: { top: 15, right: 5 },
  dotBottomLeft: { bottom: 15, left: 5 },
  dotBottomRight: { bottom: 10, right: 10 },

  // Dimmed icons
  dimmedContainer: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  dimmedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joyMeterContainer: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  joyLabel: {
    fontSize: FONT_SIZE.xs,
  },
  joyBarWrapper: {
    flex: 1,
  },

  // Recovery progress
  recoveryContainer: {
    width: '100%',
    alignItems: 'center',
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recoveryCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLine: {
    marginTop: SPACING.sm,
  },

  // Scattered focus
  scatteredContainer: {
    width: 200,
    height: 160,
    position: 'relative',
  },
  scatteredIcon: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scatteredOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
  },
  scatteredBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
  },

  // Shame cycle
  cycleContainer: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  cycleNode: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  cycleTop: {
    top: 0,
    left: '50%',
    marginLeft: -20,
  },
  cycleRight: {
    top: '50%',
    right: 0,
    marginTop: -20,
  },
  cycleBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -24,
  },
  cycleLeft: {
    top: '50%',
    left: 0,
    marginTop: -20,
  },
  cycleLabel: {
    fontSize: FONT_SIZE.xs,
  },
  cycleArrow: {
    position: 'absolute',
  },

  // Isolation
  isolationContainer: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  isolationCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  isolationDistant: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Brain sparkle
  brainContainer: {
    width: 160,
    height: 160,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brainCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },

  // Vibrant life
  vibrantIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joyLabelVibrant: {
    fontSize: FONT_SIZE.xs,
  },
});
