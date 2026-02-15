import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useUserStore } from '@/stores/userStore';
import { COLORS } from '@/constants/theme';
import { isExpoGo } from '@/lib/nativeGuard';

let BannerAd: any = null;
let BannerAdSize: any = {};
if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch {
    // Native module not available
  }
}

interface BannerAdViewProps {
  unitId: string;
  size?: string;
}

export function BannerAdView({ unitId, size }: BannerAdViewProps) {
  const { user } = useUserStore();

  if (user?.isPro || !BannerAd) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={size || BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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
