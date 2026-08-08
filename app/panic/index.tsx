import React, { useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraPreview } from '@/components/panic/CameraPreview';
import { PanicActionButtons } from '@/components/panic/PanicActionButtons';
import { PanicHeader } from '@/components/panic/PanicHeader';
import { SideEffectsSection } from '@/components/panic/SideEffectsSection';
import { TypewriterCapsule } from '@/components/panic/TypewriterCapsule';
import { useTypewriterMessage } from '@/hooks/panic/useTypewriterMessage';
import { useReflectionSheet } from '@/hooks/reflection/useReflectionSheet';
import { SPACING } from '@/constants/theme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

/**
 * Panic button screen shown between the dashboard SOSButton and the breathing
 * exercise. It forces the user to pause and confront the urge: front camera,
 * typewriter messages, side-effect reminders, and two explicit next-step
 * buttons that route to the breathing exercise or recovery.
 */
export default function PanicScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { displayedText, phase } = useTypewriterMessage();
  const confessRelapseAndClose = useReflectionSheet((s) => s.confessRelapseAndClose);

  useEffect(() => {
    analyticsClient.logEvent('panic_screen_viewed');
  }, []);

  // 「見てしまった」= リラプス確定。リフレクションシートと同じ確定処理
  // （ストリークのバックアップ→リセット、当日チェックイン記録、分析イベント）
  // を走らせてから /recovery へ遷移する。記録に失敗した場合は遷移しない。
  const handleWatchedPorn = async () => {
    const ok = await confessRelapseAndClose();
    if (ok) {
      router.push('/recovery');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <LinearGradient
        colors={['#0F172A', '#1F1228', '#3B0A10']}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <PanicHeader onClose={() => router.back()} />
        <ScrollView
          testID="panic-scroll-view"
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cameraSection}>
            <CameraPreview />
            <View style={styles.capsuleOverlay} pointerEvents="none">
              <TypewriterCapsule displayedText={displayedText} phase={phase} />
            </View>
          </View>

          <SideEffectsSection />
        </ScrollView>

        <View style={styles.actionButtonsWrapper}>
          <PanicActionButtons
            onThinkingOfWatching={() => router.push('/breathing?source=sos')}
            onWatchedPorn={handleWatchedPorn}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
    gap: SPACING.xl,
  },
  actionButtonsWrapper: {
    paddingBottom: SPACING.md,
  },
  cameraSection: {
    paddingHorizontal: SPACING.lg,
  },
  capsuleOverlay: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.xl,
    alignItems: 'center',
  },
});
