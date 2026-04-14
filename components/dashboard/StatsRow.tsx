import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, FONT_SIZE } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useUserStore } from '@/stores/userStore';
import { usePressAnimation } from '@/hooks/ui/usePressAnimation';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { AnimatedOrb } from './AnimatedOrb';
import { StreakEditModal } from './StreakEditModal';

interface StatsRowProps {
  onShare: () => void;
  viewShotRef?: React.RefObject<any>;
  ViewShotComponent?: React.ComponentType<any>;
}

export function StatsRow({ onShare, viewShotRef, ViewShotComponent }: StatsRowProps) {
  const { stopwatch, streakStartDate } = useDashboardStats();
  const { user, updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocale();
  const { onPressIn, onPressOut, animatedStyle } = usePressAnimation();

  const streakDays = stopwatch.days ?? 0;
  const goalReached = user?.goalDays ? streakDays >= user.goalDays : false;
  const tier = getStreakTier(streakDays, goalReached);

  const handleSave = (date: string) => {
    updateUser({ streakStartDate: date });
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare();
  };

  const Wrapper = ViewShotComponent ?? View;
  const wrapperProps = ViewShotComponent
    ? { ref: viewShotRef, options: { format: 'png', quality: 1 } }
    : {};

  return (
    <View testID="stats-row" style={styles.wrapper}>
      <Wrapper {...wrapperProps}>
        <View style={styles.orbSection}>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              testID="orb-touch"
              onLongPress={() => setEditModalVisible(true)}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={0.9}
            >
              <AnimatedOrb tierName={tier.name} size={200} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Wrapper>

      <TouchableOpacity
        testID="share-button"
        onPress={handleShare}
        style={styles.shareButton}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.shareText, { color: colors.textSecondary }]}>
          {t('dashboard.share')}
        </Text>
      </TouchableOpacity>

      <StreakEditModal
        visible={editModalVisible}
        initialDate={streakStartDate || new Date().toISOString().split('T')[0]}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.xl,
  },
  orbSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  shareButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  shareText: {
    fontSize: FONT_SIZE.xs,
  },
});
