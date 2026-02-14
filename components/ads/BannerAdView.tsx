import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useUserStore } from '@/stores/userStore';
import { COLORS } from '@/constants/theme';

interface BannerAdViewProps {
  unitId: string;
  size?: BannerAdSize;
}

export function BannerAdView({ unitId, size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: BannerAdViewProps) {
  const { user } = useUserStore();

  // Pro ユーザーには広告非表示
  if (user?.isPro) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
