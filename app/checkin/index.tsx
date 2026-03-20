import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { BinaryQuestion } from '@/components/checkin/BinaryQuestion';
import { LevelSelector } from '@/components/checkin/LevelSelector';
import { MemoInput } from '@/components/checkin/MemoInput';
import { useCheckinForm } from '@/hooks/checkin/useCheckinForm';
import { useCheckinSubmit } from '@/hooks/checkin/useCheckinSubmit';
import { useTheme } from '@/hooks/useTheme';
import { useLocale } from '@/hooks/useLocale';
import { SPACING } from '@/constants/theme';
import { analyticsClient } from '@/lib/tracking/analyticsClient';

export default function CheckinScreen() {
  const { formState, setField } = useCheckinForm();
  const { submit, isLoading, error } = useCheckinSubmit();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();

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
      Alert.alert(t('checkinForm.error'), result.error || t('checkinForm.submitFailed'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <BinaryQuestion
          label={t('checkinForm.watchedPorn')}
          value={formState.watchedPorn}
          onChange={(v) => setField('watchedPorn', v)}
        />

        <LevelSelector
          label={t('checkinForm.urgeLevel')}
          value={formState.urgeLevel}
          onChange={(v) => setField('urgeLevel', v)}
          options={[
            { value: 0, label: t('checkinForm.urgeLevels.none') },
            { value: 1, label: t('checkinForm.urgeLevels.low') },
            { value: 2, label: t('checkinForm.urgeLevels.moderate') },
            { value: 3, label: t('checkinForm.urgeLevels.high') },
            { value: 4, label: t('checkinForm.urgeLevels.max') },
          ]}
        />

        <LevelSelector
          label={t('checkinForm.stressLevel')}
          value={formState.stressLevel}
          onChange={(v) => setField('stressLevel', v)}
          options={[
            { value: 0, label: t('checkinForm.urgeLevels.none') },
            { value: 1, label: t('checkinForm.urgeLevels.low') },
            { value: 2, label: t('checkinForm.urgeLevels.moderate') },
            { value: 3, label: t('checkinForm.urgeLevels.high') },
            { value: 4, label: t('checkinForm.urgeLevels.max') },
          ]}
        />

        <LevelSelector
          label={t('checkinForm.qualityOfLife')}
          value={formState.qualityOfLife}
          onChange={(v) => setField('qualityOfLife', v)}
          options={[
            { value: 1, label: t('checkinForm.qualityLevels.bad') },
            { value: 2, label: t('checkinForm.qualityLevels.slightlyBad') },
            { value: 3, label: t('checkinForm.qualityLevels.normal') },
            { value: 4, label: t('checkinForm.qualityLevels.slightlyGood') },
            { value: 5, label: t('checkinForm.qualityLevels.good') },
          ]}
        />

        <MemoInput
          value={formState.memo}
          onChange={(v) => setField('memo', v)}
        />

        <Button
          title={t('checkinForm.submit')}
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
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 50,
  },
});
