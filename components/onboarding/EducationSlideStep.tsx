import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import type { EducationSlide } from '@/constants/education';

interface EducationSlideStepProps {
  slide: EducationSlide;
  slideIndex: number;
  totalSlides: number;
}

// --- View-based Illustrations ---

function DopamineBarsIllustration() {
  const bars = [
    { label: '食事', height: 40, color: COLORS.success },
    { label: '運動', height: 35, color: COLORS.success },
    { label: 'ポルノ', height: 100, color: COLORS.warning },
    { label: '達成感', height: 45, color: COLORS.success },
    { label: '会話', height: 30, color: COLORS.success },
  ];

  return (
    <View style={illStyles.barsContainer}>
      {/* Arrow above the spike */}
      <View style={illStyles.arrowContainer}>
        <Ionicons name="arrow-up" size={20} color={COLORS.warning} />
      </View>
      <View style={illStyles.barsRow}>
        {bars.map((bar) => (
          <View key={bar.label} style={illStyles.barColumn}>
            <View
              style={[
                illStyles.bar,
                {
                  height: bar.height,
                  backgroundColor: bar.color,
                },
              ]}
            />
            <Text style={illStyles.barLabel}>{bar.label}</Text>
          </View>
        ))}
      </View>
      {/* Baseline */}
      <View style={illStyles.baseline} />
    </View>
  );
}

function LockIconIllustration() {
  return (
    <View style={illStyles.lockContainer}>
      {/* Decorative dots */}
      <View style={[illStyles.dot, illStyles.dotTopLeft]} />
      <View style={[illStyles.dot, illStyles.dotTopRight]} />
      <View style={[illStyles.dot, illStyles.dotBottomLeft]} />
      <View style={[illStyles.dot, illStyles.dotBottomRight]} />
      {/* Center circle with lock icon */}
      <View style={illStyles.lockCircle}>
        <Ionicons name="lock-open-outline" size={48} color={COLORS.warning} />
      </View>
    </View>
  );
}

function DimmedIconsIllustration() {
  const icons: Array<React.ComponentProps<typeof Ionicons>['name']> = [
    'restaurant-outline',
    'people-outline',
    'briefcase-outline',
    'game-controller-outline',
    'musical-notes-outline',
  ];

  return (
    <View style={illStyles.dimmedContainer}>
      <View style={illStyles.iconsRow}>
        {icons.map((icon) => (
          <View key={icon} style={illStyles.dimmedIconCircle}>
            <Ionicons name={icon} size={24} color={COLORS.textSecondary} />
          </View>
        ))}
      </View>
      {/* Joy meter */}
      <View style={illStyles.joyMeterContainer}>
        <Text style={illStyles.joyLabel}>Joy</Text>
        <View style={illStyles.joyBarWrapper}>
          <ProgressBar progress={0.12} height={8} color={COLORS.textSecondary} />
        </View>
      </View>
    </View>
  );
}

function RecoveryProgressIllustration() {
  const steps: Array<{
    icon: React.ComponentProps<typeof Ionicons>['name'];
    size: number;
    color: string;
  }> = [
    { icon: 'cloudy-outline', size: 24, color: COLORS.textSecondary },
    { icon: 'cloudy-outline', size: 28, color: '#5A5A6A' },
    { icon: 'partly-sunny-outline', size: 32, color: COLORS.warning },
    { icon: 'partly-sunny-outline', size: 36, color: '#7BC47F' },
    { icon: 'sunny-outline', size: 40, color: COLORS.success },
  ];

  return (
    <View style={illStyles.recoveryContainer}>
      <View style={illStyles.recoveryRow}>
        {steps.map((s, i) => (
          <View
            key={i}
            style={[
              illStyles.recoveryCircle,
              {
                width: 44 + i * 4,
                height: 44 + i * 4,
                borderRadius: (44 + i * 4) / 2,
                backgroundColor:
                  i < 2
                    ? COLORS.surface
                    : i === 2
                      ? COLORS.surfaceHighlight
                      : `${COLORS.success}20`,
              },
            ]}
          >
            <Ionicons name={s.icon} size={s.size} color={s.color} />
          </View>
        ))}
      </View>
      {/* Arrow line connecting them */}
      <View style={illStyles.arrowLine}>
        <Ionicons name="arrow-forward" size={16} color={COLORS.textSecondary} />
      </View>
    </View>
  );
}

function ScatteredFocusIllustration() {
  const items: Array<{
    icon: React.ComponentProps<typeof Ionicons>['name'];
    offset: { top?: number; left?: number; right?: number; bottom?: number };
    rotation: string;
  }> = [
    { icon: 'time-outline', offset: { top: 10, left: 20 }, rotation: '-15deg' },
    { icon: 'document-text-outline', offset: { top: 5, right: 25 }, rotation: '12deg' },
    { icon: 'code-slash-outline', offset: { bottom: 20, left: 50 }, rotation: '-8deg' },
  ];

  return (
    <View style={illStyles.scatteredContainer}>
      {items.map((item) => (
        <View
          key={item.icon}
          style={[
            illStyles.scatteredIcon,
            item.offset,
            { transform: [{ rotate: item.rotation }] },
          ]}
        >
          <Ionicons name={item.icon} size={28} color={COLORS.textSecondary} />
        </View>
      ))}
      <View style={illStyles.scatteredOverlay}>
        <Ionicons name="close-circle-outline" size={32} color={COLORS.danger} />
      </View>
      <View style={illStyles.scatteredBarContainer}>
        <ProgressBar progress={0.12} height={6} color={COLORS.textSecondary} />
      </View>
    </View>
  );
}

function ShameCycleIllustration() {
  const steps: Array<{
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }> = [
    { label: '視聴', icon: 'eye-outline' },
    { label: '後悔', icon: 'sad-outline' },
    { label: 'ストレス', icon: 'alert-circle-outline' },
    { label: '渇望', icon: 'flame-outline' },
  ];

  return (
    <View style={illStyles.cycleContainer}>
      {/* Top */}
      <View style={[illStyles.cycleNode, illStyles.cycleTop]}>
        <Ionicons name={steps[0].icon} size={20} color={COLORS.warning} />
        <Text style={illStyles.cycleLabel}>{steps[0].label}</Text>
      </View>
      {/* Right */}
      <View style={[illStyles.cycleNode, illStyles.cycleRight]}>
        <Ionicons name={steps[1].icon} size={20} color={COLORS.warning} />
        <Text style={illStyles.cycleLabel}>{steps[1].label}</Text>
      </View>
      {/* Bottom */}
      <View style={[illStyles.cycleNode, illStyles.cycleBottom]}>
        <Ionicons name={steps[2].icon} size={20} color={COLORS.warning} />
        <Text style={illStyles.cycleLabel}>{steps[2].label}</Text>
      </View>
      {/* Left */}
      <View style={[illStyles.cycleNode, illStyles.cycleLeft]}>
        <Ionicons name={steps[3].icon} size={20} color={COLORS.warning} />
        <Text style={illStyles.cycleLabel}>{steps[3].label}</Text>
      </View>
      {/* Arrows between nodes */}
      <View style={[illStyles.cycleArrow, { top: 20, right: 30 }]}>
        <Ionicons name="arrow-forward" size={14} color={COLORS.warning} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.cycleArrow, { bottom: 30, right: 20 }]}>
        <Ionicons name="arrow-down" size={14} color={COLORS.warning} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.cycleArrow, { bottom: 20, left: 30 }]}>
        <Ionicons name="arrow-back" size={14} color={COLORS.warning} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.cycleArrow, { top: 30, left: 20 }]}>
        <Ionicons name="arrow-up" size={14} color={COLORS.warning} style={{ opacity: 0.5 }} />
      </View>
    </View>
  );
}

function IsolationIllustration() {
  return (
    <View style={illStyles.isolationContainer}>
      {/* Central person */}
      <View style={illStyles.isolationCenter}>
        <Ionicons name="person-outline" size={36} color={COLORS.textSecondary} />
      </View>
      {/* Distant people */}
      <View style={[illStyles.isolationDistant, { top: 0, left: '50%', marginLeft: -16 }]}>
        <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} style={{ opacity: 0.25 }} />
      </View>
      <View style={[illStyles.isolationDistant, { bottom: 0, left: '50%', marginLeft: -16 }]}>
        <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} style={{ opacity: 0.25 }} />
      </View>
      <View style={[illStyles.isolationDistant, { top: '50%', left: 0, marginTop: -16 }]}>
        <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} style={{ opacity: 0.25 }} />
      </View>
      <View style={[illStyles.isolationDistant, { top: '50%', right: 0, marginTop: -16 }]}>
        <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} style={{ opacity: 0.25 }} />
      </View>
    </View>
  );
}

function BrainSparkleIllustration() {
  return (
    <View style={illStyles.brainContainer}>
      {/* Central icon */}
      <View style={illStyles.brainCircle}>
        <Ionicons name="flash-outline" size={48} color={COLORS.success} />
      </View>
      {/* Sparkles */}
      <View style={[illStyles.sparkle, { top: 5, right: 10 }]}>
        <Ionicons name="sparkles-outline" size={20} color={COLORS.success} style={{ opacity: 0.6 }} />
      </View>
      <View style={[illStyles.sparkle, { top: 10, left: 5 }]}>
        <Ionicons name="sparkles-outline" size={16} color={COLORS.success} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.sparkle, { bottom: 10, right: 5 }]}>
        <Ionicons name="sparkles-outline" size={18} color={COLORS.success} style={{ opacity: 0.5 }} />
      </View>
      <View style={[illStyles.sparkle, { bottom: 5, left: 10 }]}>
        <Ionicons name="sparkles-outline" size={20} color={COLORS.success} style={{ opacity: 0.6 }} />
      </View>
    </View>
  );
}

function VibrantLifeIllustration() {
  const icons: Array<React.ComponentProps<typeof Ionicons>['name']> = [
    'restaurant-outline',
    'people-outline',
    'briefcase-outline',
    'game-controller-outline',
    'musical-notes-outline',
  ];

  return (
    <View style={illStyles.dimmedContainer}>
      <View style={illStyles.iconsRow}>
        {icons.map((icon) => (
          <View key={icon} style={illStyles.vibrantIconCircle}>
            <Ionicons name={icon} size={24} color={COLORS.primary} />
          </View>
        ))}
      </View>
      <View style={illStyles.joyMeterContainer}>
        <Text style={illStyles.joyLabelVibrant}>Joy</Text>
        <View style={illStyles.joyBarWrapper}>
          <ProgressBar progress={0.88} height={8} color={COLORS.success} />
        </View>
      </View>
    </View>
  );
}

function renderIllustration(type: EducationSlide['illustrationType']) {
  switch (type) {
    case 'dopamine_bars':
      return <DopamineBarsIllustration />;
    case 'lock_icon':
      return <LockIconIllustration />;
    case 'dimmed_icons':
      return <DimmedIconsIllustration />;
    case 'recovery_progress':
      return <RecoveryProgressIllustration />;
    case 'scattered_focus':
      return <ScatteredFocusIllustration />;
    case 'shame_cycle':
      return <ShameCycleIllustration />;
    case 'isolation':
      return <IsolationIllustration />;
    case 'brain_sparkle':
      return <BrainSparkleIllustration />;
    case 'vibrant_life':
      return <VibrantLifeIllustration />;
  }
}

// --- Page Dots ---

function PageDots({ current, total }: { current: number; total: number }) {
  return (
    <View testID="page-dots" style={styles.dotsContainer}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          testID={i === current ? `page-dot-active-${i}` : `page-dot-${i}`}
          style={[
            styles.dot,
            i === current && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

// --- Main Component ---

export function EducationSlideStep({
  slide,
  slideIndex,
  totalSlides,
}: EducationSlideStepProps) {
  return (
    <View testID="education-slide-container" style={styles.container}>
      <PageDots current={slideIndex} total={totalSlides} />

      <View style={styles.illustrationContainer}>
        {renderIllustration(slide.illustrationType)}
      </View>

      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
    borderRadius: 4,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  body: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
});

// --- Illustration Styles ---

const illStyles = StyleSheet.create({
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
    // Position above the ポルノ bar (3rd bar, centered)
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
    color: COLORS.textSecondary,
  },
  baseline: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.border,
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
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
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
    backgroundColor: COLORS.surface,
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
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surface,
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
    color: COLORS.warning,
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
    backgroundColor: COLORS.surface,
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
    backgroundColor: `${COLORS.success}20`,
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
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joyLabelVibrant: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
  },
});
