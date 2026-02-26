import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { BinaryQuestion } from '@/components/checkin/BinaryQuestion';
import { LevelSlider } from '@/components/checkin/LevelSlider';
import { MemoInput } from '@/components/checkin/MemoInput';
import { useCheckinForm } from '@/hooks/checkin/useCheckinForm';
import { useCheckinSubmit } from '@/hooks/checkin/useCheckinSubmit';
import { COLORS, SPACING } from '@/constants/theme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export default function CheckinScreen() {
  const { formState, setField } = useCheckinForm();
  const { submit, isLoading, error } = useCheckinSubmit();
  const router = useRouter();

  const handleSubmit = async () => {
    const result = await submit(formState);
    if (result.success) {
      analyticsClient.logEvent('checkin_submitted', {
        watched_porn: formState.watchedPorn!,
        urge_level: formState.urgeLevel,
        stress_level: formState.stressLevel,
      });
      if (formState.watchedPorn) {
        router.replace('/recovery');
      } else {
        router.replace('/checkin/complete');
      }
    } else {
      Alert.alert('エラー', result.error || '記録に失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <BinaryQuestion
          label="❶ ポルノを見ましたか？"
          value={formState.watchedPorn}
          onChange={(v) => setField('watchedPorn', v)}
        />

        <LevelSlider
          label="❷ 誘惑レベル"
          value={formState.urgeLevel}
          onChange={(v) => setField('urgeLevel', v)}
          minLabel="なし"
          maxLabel="高い"
        />

        <LevelSlider
          label="❸ ストレスレベル"
          value={formState.stressLevel}
          onChange={(v) => setField('stressLevel', v)}
          minLabel="低い"
          maxLabel="高い"
        />

        <LevelSlider
          label="❹ 今日の生活の質"
          value={formState.qualityOfLife}
          onChange={(v) => setField('qualityOfLife', v)}
          maximumValue={5}
          minimumValue={1}
          minLabel="悪い"
          maxLabel="良い"
        />

        <MemoInput
          value={formState.memo}
          onChange={(v) => setField('memo', v)}
        />

        <Button
          title="記録する"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={formState.watchedPorn === null}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 50,
  },
});
