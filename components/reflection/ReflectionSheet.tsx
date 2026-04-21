import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useReflectionSheet } from '@/hooks/reflection/useReflectionSheet';
import { RADIUS, SPACING } from '@/constants/theme';
import { ReflectionStepContainer } from './ReflectionStepContainer';
import { ReflectionStepRelapse } from './ReflectionStepRelapse';
import { ReflectionStepUrge } from './ReflectionStepUrge';
import { ReflectionStepComplete } from './ReflectionStepComplete';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_TOP_OFFSET = SCREEN_HEIGHT * 0.15;
const ANIM_DURATION = 400;
const EASING = Easing.bezier(0.25, 1, 0.5, 1);

export function ReflectionSheet() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const visible = useReflectionSheet((s) => s.visible);
  const step = useReflectionSheet((s) => s.step);
  const isSubmitting = useReflectionSheet((s) => s.isSubmitting);
  const close = useReflectionSheet((s) => s.close);
  const selectWatchedPorn = useReflectionSheet((s) => s.selectWatchedPorn);
  const selectUrgeLevelAndSubmit = useReflectionSheet((s) => s.selectUrgeLevelAndSubmit);
  const confessRelapseAndClose = useReflectionSheet((s) => s.confessRelapseAndClose);
  const finish = useReflectionSheet((s) => s.finish);

  const handleRelapseSelect = async (watchedPorn: boolean) => {
    if (!watchedPorn) {
      selectWatchedPorn(false);
      return;
    }
    const ok = await confessRelapseAndClose();
    if (ok) {
      router.push('/recovery');
    }
  };

  const progress = useSharedValue(0);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, { duration: ANIM_DURATION, easing: EASING });
    } else if (mounted) {
      progress.value = withTiming(
        0,
        { duration: ANIM_DURATION, easing: EASING },
        (finished) => {
          if (finished) {
            runOnJS(setMounted)(false);
          }
        }
      );
    }
  }, [visible, mounted, progress]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.6,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (1 - progress.value) * SCREEN_HEIGHT,
      },
    ],
  }));

  if (!mounted && !visible) return null;

  const renderStep = () => {
    if (step === 1) {
      return <ReflectionStepRelapse onSelect={handleRelapseSelect} />;
    }
    if (step === 2) {
      return (
        <ReflectionStepUrge
          onSelect={selectUrgeLevelAndSubmit}
          isSubmitting={isSubmitting}
        />
      );
    }
    return <ReflectionStepComplete onFinish={finish} />;
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View
          style={[styles.overlay, overlayStyle, { backgroundColor: '#000' }]}
          pointerEvents={visible ? 'auto' : 'none'}
        >
          <Pressable
            testID="reflection-sheet-overlay"
            style={StyleSheet.absoluteFill}
            onPress={close}
          />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          {isDark ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isDark ? colors.surfaceGlass : colors.surface },
            ]}
          />
          <View style={[styles.handleContainer]}>
            <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />
          </View>
          <TouchableOpacity activeOpacity={1} style={styles.content}>
            <ReflectionStepContainer stepKey={step}>
              {renderStep()}
            </ReflectionStepContainer>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SHEET_TOP_OFFSET,
    bottom: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: RADIUS.sm,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
