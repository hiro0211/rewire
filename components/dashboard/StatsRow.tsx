import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { SPACING } from '@/constants/theme';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';
import { useUserStore } from '@/stores/userStore';
import { usePressAnimation } from '@/hooks/ui/usePressAnimation';
import { getStreakTier } from '@/hooks/streak/useStreakTier';
import { AnimatedOrb } from './AnimatedOrb';
import { StreakEditModal } from './StreakEditModal';

export function StatsRow() {
  const { stopwatch, streakStartDate } = useDashboardStats();
  const { user, updateUser } = useUserStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { onPressIn, onPressOut, animatedStyle } = usePressAnimation();

  const streakDays = stopwatch.days ?? 0;
  const goalReached = user?.goalDays ? streakDays >= user.goalDays : false;
  const tier = getStreakTier(streakDays, goalReached);

  const handleSave = (date: string) => {
    updateUser({ streakStartDate: date });
  };

  return (
    <View testID="stats-row" style={styles.wrapper}>
      <View style={styles.orbSection}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            testID="orb-touch"
            onLongPress={() => setEditModalVisible(true)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={0.9}
          >
            <AnimatedOrb chapterId={tier.name} size={200} />
          </TouchableOpacity>
        </Animated.View>
      </View>

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
    marginBottom: SPACING.xxxl,
  },
  orbSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
});
