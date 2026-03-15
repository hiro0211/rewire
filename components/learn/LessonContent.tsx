import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SPACING, FONT_SIZE } from '@/constants/theme';

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  const { colors } = useTheme();

  const sections = content.split('\n\n');

  return (
    <View style={styles.container}>
      {sections.map((section, index) => {
        const trimmed = section.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <Text
              key={index}
              style={[styles.heading, { color: colors.text }]}
            >
              {trimmed.replace('### ', '')}
            </Text>
          );
        }

        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <Text
              key={index}
              style={[styles.bold, { color: colors.text }]}
            >
              {trimmed.replace(/\*\*/g, '')}
            </Text>
          );
        }

        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').filter((line) => line.startsWith('- '));
          return (
            <View key={index} style={styles.list}>
              {items.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={[styles.bullet, { color: colors.cyan }]}>•</Text>
                  <Text style={[styles.listText, { color: colors.text }]}>
                    {item.replace('- ', '')}
                  </Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <Text
            key={index}
            style={[styles.paragraph, { color: colors.text }]}
          >
            {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  bold: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  paragraph: {
    fontSize: FONT_SIZE.md,
    lineHeight: 26,
  },
  list: {
    gap: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bullet: {
    fontSize: FONT_SIZE.md,
    lineHeight: 26,
  },
  listText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    lineHeight: 26,
  },
});
