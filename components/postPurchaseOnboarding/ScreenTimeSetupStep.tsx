import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { DeviceActivitySelectionSheetView } from 'react-native-device-activity';
import { ScreenTimeSetupIntro } from '@/components/screen-time/ScreenTimeSetupIntro';
import { useScreenTimeSetup } from '@/hooks/screenTime/useScreenTimeSetup';

interface ScreenTimeSetupStepProps {
  onComplete: () => void;
}

/**
 * PPO step 1: ScreenTime（Family Controls）ブロッカーをセットアップ。
 * Safari 拡張からの全ブラウザ共通ブロッカーへの移行に伴い、SafariSetupStep を置換。
 */
export function ScreenTimeSetupStep({ onComplete }: ScreenTimeSetupStepProps) {
  const {
    step,
    isLoading,
    pendingSelection,
    startSetup,
    handlePickerChange,
    finalizePicker,
    cancelPicker,
  } = useScreenTimeSetup();

  // 完了・拒否・スキップいずれの場合も次ステップへ進める
  useEffect(() => {
    if (step === 'completed' || step === 'denied') {
      onComplete();
    }
  }, [step, onComplete]);

  return (
    <View style={styles.container}>
      <ScreenTimeSetupIntro
        onEnable={startSetup}
        onSkip={onComplete}
        isLoading={isLoading}
      />
      {step === 'picking' && Platform.OS === 'ios' && (
        <View style={styles.pickerOverlay} testID="screen-time-picker-overlay">
          <DeviceActivitySelectionSheetView
            style={styles.pickerSheet}
            familyActivitySelection={pendingSelection?.familyActivitySelection ?? null}
            onSelectionChange={(event) => {
              const sel = event.nativeEvent.familyActivitySelection ?? '';
              const count =
                (event.nativeEvent.applicationCount ?? 0) +
                (event.nativeEvent.categoryCount ?? 0);
              handlePickerChange(sel, count);
            }}
            onDismissRequest={() => {
              if (pendingSelection) {
                void finalizePicker();
              } else {
                cancelPicker();
              }
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerSheet: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
