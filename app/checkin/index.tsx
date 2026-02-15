import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { Button } from '@/components/ui/Button';
import { BinaryQuestion } from '@/components/checkin/BinaryQuestion';
import { LevelSlider } from '@/components/checkin/LevelSlider';
import { MemoInput } from '@/components/checkin/MemoInput';
import { useCheckinForm } from '@/hooks/checkin/useCheckinForm';
import { useCheckinSubmit } from '@/hooks/checkin/useCheckinSubmit';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

export default function CheckinScreen() {
  const { formState, setField } = useCheckinForm();
  const { submit, isLoading, error } = useCheckinSubmit();
  const router = useRouter();

  const handleSubmit = async () => {
    const result = await submit(formState);
    if (result.success) {
      if (formState.watchedPorn) {
        // Need to pass checkinId if we want to associate recovery data
        // For MVP, just route to Recovery
        router.replace('/recovery');
      } else {
        router.replace('/checkin/complete');
      }
    } else {
      Alert.alert('エラー', result.error || '記録に失敗しました');
    }
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 戻る</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>デイリーチェックイン</Text>
        
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
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  backButton: {
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 50,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
  },
});
