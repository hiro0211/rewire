import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
// Note: We'll install vector icons later or use a simple text for MVP
// import { Ionicons } from '@expo/vector-icons'; 

export function SOSButton() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/breathing');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* <Ionicons name="warning" size={24} color="#FFF" /> */}
      <View style={styles.iconPlaceholder} /> 
      <Text style={styles.text}>深呼吸</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xxl + 60, // Above tab bar
    right: SPACING.lg,
    backgroundColor: COLORS.warning,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  iconPlaceholder: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: FONT_SIZE.xs,
  },
});
