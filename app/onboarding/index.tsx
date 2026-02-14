import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    title: '年齢確認',
    description: 'このアプリは18歳以上の方を対象としています。',
    type: 'ageVerification' as const,
  },
  {
    title: 'あなたの名前は？',
    description: 'アプリ内で呼びかけるニックネームを教えてください。\n（匿名で構いません）',
    type: 'nickname' as const,
  },
  {
    title: 'データの取り扱いについて',
    description: 'Rewireはあなたの回復をサポートするため、\n以下のデータを端末内にのみ保存します。',
    type: 'consent' as const,
  },
  {
    title: '通知を設定',
    description: '毎日の振り返りを習慣化するために、\n通知を許可してください。',
    type: 'notification' as const,
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [isOver18, setIsOver18] = useState(false);
  const [showUnderageMessage, setShowUnderageMessage] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [dataAgreed, setDataAgreed] = useState(false);
  const { setUser } = useUserStore();
  const router = useRouter();

  const handleNext = async () => {
    const currentStep = STEPS[step];
    if (step < STEPS.length - 1) {
      // Age verification step - handled by buttons, not "次へ"
      if (currentStep.type === 'ageVerification') return;
      // Nickname validation
      if (currentStep.type === 'nickname' && !nickname.trim()) return;
      // Consent validation
      if (currentStep.type === 'consent' && (!privacyAgreed || !dataAgreed)) return;
      setStep(step + 1);
    } else {
      router.push({
        pathname: '/onboarding/goal',
        params: {
          nickname,
          consentGivenAt: new Date().toISOString(),
          ageVerifiedAt: new Date().toISOString(),
        },
      });
    }
  };

  const currentStep = STEPS[step];

  const isNextDisabled = (() => {
    const cs = STEPS[step];
    if (cs.type === 'ageVerification') return true;
    if (cs.type === 'nickname') return !nickname.trim();
    if (cs.type === 'consent') return !privacyAgreed || !dataAgreed;
    return false;
  })();

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

        {currentStep.type === 'ageVerification' && (
          <View style={styles.ageContainer}>
            {showUnderageMessage ? (
              <Text style={styles.underageMessage}>
                申し訳ありませんが、このアプリは18歳以上の方のみご利用いただけます。
              </Text>
            ) : (
              <>
                <Button
                  title="はい、18歳以上です"
                  variant="primary"
                  onPress={() => {
                    setIsOver18(true);
                    setStep(step + 1);
                  }}
                  style={styles.ageButton}
                />
                <Button
                  title="いいえ、18歳未満です"
                  variant="ghost"
                  onPress={() => setShowUnderageMessage(true)}
                  style={styles.ageButton}
                />
              </>
            )}
          </View>
        )}

        {currentStep.type === 'nickname' && (
          <TextInput
            style={styles.input}
            placeholder="ニックネーム"
            placeholderTextColor={COLORS.textSecondary}
            value={nickname}
            onChangeText={setNickname}
            autoFocus
          />
        )}

        {currentStep.type === 'consent' && (
          <View style={styles.consentContainer}>
            <Text style={styles.dataList}>
              {'・性的行動に関する記録\n・ストレスレベル・衝動レベル\n・呼吸エクササイズの記録\n・回復記録・日記'}
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPrivacyAgreed(!privacyAgreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  privacyAgreed && styles.checkboxChecked,
                ]}
              >
                {privacyAgreed && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                プライバシーポリシーに同意します
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDataAgreed(!dataAgreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  dataAgreed && styles.checkboxChecked,
                ]}
              >
                {dataAgreed && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                上記データの保存に同意します
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {currentStep.type !== 'ageVerification' && (
        <View style={styles.footer}>
          <Button
            title="次へ"
            onPress={handleNext}
            disabled={isNextDisabled}
          />
        </View>
      )}
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
  ageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  ageButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  underageMessage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  consentContainer: {
    width: '100%',
  },
  dataList: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
});
