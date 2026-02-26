import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { TriggerSelector } from '@/components/recovery/TriggerSelector';
import { NextActionList } from '@/components/recovery/NextActionList';
import { recoveryService } from '@/features/recovery/recoveryService';
import { useUserStore } from '@/stores/userStore';
import { useCheckinStore } from '@/stores/checkinStore';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RecoveryScreen() {
  const [trigger, setTrigger] = useState<string | null>(null);
  const { user } = useUserStore();
  const { todayCheckin } = useCheckinStore();
  const router = useRouter();

  const handleSelectTrigger = async (selected: string) => {
    setTrigger(selected);
    analyticsClient.logEvent('recovery_trigger_selected', { trigger: selected });
    if (user && todayCheckin) {
      await recoveryService.saveRecovery(user.id, selected, todayCheckin.id);
    }
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>大丈夫。{'\n'}ここから始めよう。</Text>
        
        <View style={styles.divider} />

        <TriggerSelector selected={trigger} onSelect={handleSelectTrigger} />

        {trigger && (
          <>
             <View style={styles.divider} />
             <NextActionList />

             <View style={styles.messageBox}>
               <Text style={styles.messageText}>
                 あなたの連続記録はリセットされましたが、
                 学びの記録は残っています。
               </Text>
             </View>
          </>
        )}

      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.sm,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 50,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 36,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceHighlight,
    marginVertical: SPACING.xl,
  },
  messageBox: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 8,
  },
  messageText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
