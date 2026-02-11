import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { useUserStore } from '@/stores/userStore';

const STEPS = [
  {
    title: 'Rewire へようこそ',
    description: '人生を前に進めるために、\n悪い習慣を断ち切る旅を始めましょう。',
  },
  {
    title: 'あなたの名前は？',
    description: 'アプリ内で呼びかけるニックネームを教えてください。\n（匿名で構いません）',
    inputRequest: 'nickname',
  },
  {
    title: '通知を設定',
    description: '毎日の振り返りを習慣化するために、\n通知を許可してください。',
    permissionRequest: 'notification',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const { setUser } = useUserStore();
  const router = useRouter();

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      if (STEPS[step].inputRequest === 'nickname' && !nickname.trim()) {
        return; // Validation
      }
      setStep(step + 1);
    } else {
      // Complete Onboarding
      // Save partial user data (id will be generated in store/service logic usually, but here manually for now)
      // Actually we will save user after Goal setting.
      // Pass nickname to next screen or save temporarily
      router.push({ pathname: '/onboarding/goal', params: { nickname } });
    }
  };

  const currentStep = STEPS[step];

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotCompleted,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>

        {currentStep.inputRequest === 'nickname' && (
          <TextInput
            style={styles.input}
            placeholder="ニックネーム"
            placeholderTextColor={COLORS.textSecondary}
            value={nickname}
            onChangeText={setNickname}
            autoFocus
          />
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title={step === STEPS.length - 1 ? '次へ' : '次へ'}
          onPress={handleNext}
          disabled={currentStep.inputRequest === 'nickname' && !nickname.trim()}
        />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceHighlight,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
  },
  footer: {
    marginBottom: SPACING.xl,
  },
});
