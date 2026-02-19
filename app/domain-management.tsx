import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { usageTrackerBridge } from '@/lib/usageTracker/usageTrackerBridge';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';

export default function DomainManagementScreen() {
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setIsLoading(true);
    const list = await usageTrackerBridge.getDomainList();
    setDomains(list);
    setIsLoading(false);
  };

  const handleAdd = useCallback(async () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;

    // Basic domain validation
    if (!trimmed.includes('.')) {
      Alert.alert('無効なドメイン', '有効なドメイン名を入力してください（例: example.com）');
      return;
    }

    if (domains.includes(trimmed)) {
      Alert.alert('重複', 'このドメインは既に追加されています');
      return;
    }

    const updated = [...domains, trimmed];
    await usageTrackerBridge.setDomainList(updated);
    setDomains(updated);
    setNewDomain('');
  }, [newDomain, domains]);

  const handleRemove = useCallback(
    (domain: string) => {
      Alert.alert('ドメインを削除', `「${domain}」を削除しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const updated = domains.filter((d) => d !== domain);
            await usageTrackerBridge.setDomainList(updated);
            setDomains(updated);
          },
        },
      ]);
    },
    [domains]
  );

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.domainRow}>
      <Text style={styles.domainText} numberOfLines={1}>
        {item}
      </Text>
      <TouchableOpacity
        onPress={() => handleRemove(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newDomain}
          onChangeText={setNewDomain}
          placeholder="example.com"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>
        登録済みドメイン ({domains.length})
      </Text>

      <FlatList
        data={domains}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              ドメインが登録されていません
            </Text>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  domainText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    flex: 1,
    marginRight: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
});
