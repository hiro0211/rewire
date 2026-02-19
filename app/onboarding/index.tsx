import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { useUserStore } from '@/stores/userStore';

const FEATURES = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Safariポルノブロッカー',
    description: 'アダルトサイトへのアクセスを自動ブロック',
    pro: true,
  },
  {
    icon: 'analytics-outline' as const,
    title: '毎日の振り返り',
    description: '衝動やストレスを記録して自分を客観視',
    pro: false,
  },
  {
    icon: 'fitness-outline' as const,
    title: '呼吸エクササイズ',
    description: '衝動が来たとき、呼吸で乗り越える',
    pro: false,
  },
];

const STEPS = [
  {
    title: 'ポルノをやめる、\n人生を変える',
    description: 'Rewireはポルノ習慣から抜け出したい\nあなたを支えるアプリです。\n科学的アプローチで回復をサポートします。',
  },
  {
    title: 'Rewireでできること',
    description: '',
    type: 'features' as const,
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
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [dataAgreed, setDataAgreed] = useState(false);
  const { setUser } = useUserStore();
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;

  // Refs to access latest state from PanResponder closure
  const stateRef = useRef({ step, nickname, privacyAgreed, dataAgreed });
  stateRef.current = { step, nickname, privacyAgreed, dataAgreed };

  const animateTransition = (direction: number, callback: () => void) => {
    Animated.timing(translateX, {
      toValue: direction * 300,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(direction * -300);
      callback();
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const canAdvanceAt = (s: number, nick: string, priv: boolean, data: boolean) => {
    const cs = STEPS[s];
    if (cs.type === 'nickname') return !!nick.trim();
    if (cs.type === 'consent') return priv && data;
    return true;
  };

  const SWIPE_THRESHOLD = 50;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 20 && Math.abs(gs.dy) < 50,
      onPanResponderRelease: (_, gs) => {
        const { step: s, nickname: n, privacyAgreed: p, dataAgreed: d } = stateRef.current;
        if (gs.dx < -SWIPE_THRESHOLD) {
          if (s < STEPS.length - 1 && canAdvanceAt(s, n, p, d)) {
            animateTransition(-1, () => setStep(s + 1));
          }
        } else if (gs.dx > SWIPE_THRESHOLD) {
          if (s > 0) {
            animateTransition(1, () => setStep(s - 1));
          }
        }
      },
    })
  ).current;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      if (!canAdvanceAt(step, nickname, privacyAgreed, dataAgreed)) return;
      animateTransition(-1, () => setStep(step + 1));
    } else {
      router.push({
        pathname: '/onboarding/goal',
        params: {
          nickname,
          consentGivenAt: new Date().toISOString(),
        },
      });
    }
  };

  const currentStep = STEPS[step];

  const isNextDisabled = !canAdvanceAt(step, nickname, privacyAgreed, dataAgreed);

  return (
    <SafeAreaWrapper style={styles.container}>
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
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

        {currentStep.type === 'features' && (
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    {feature.pro && (
                      <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
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
      </Animated.View>

      <View style={styles.footer}>
        <Button
          title="次へ"
          onPress={handleNext}
          disabled={isNextDisabled}
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
  featuresContainer: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  featureTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  proBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
