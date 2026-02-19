import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/constants/theme';
import { contentBlockerBridge } from '@/lib/contentBlocker/contentBlockerBridge';
import { Text } from '@/components/Themed';

/** Strip protocol and trailing slashes to extract a bare domain. */
function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/\/.*$/, '');
  return domain;
}

export default function CustomBlocklistScreen() {
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setIsLoading(true);
    const list = await contentBlockerBridge.getCustomDomains();
    setDomains(list);
    setIsLoading(false);
  };

  const handleAdd = useCallback(async () => {
    const domain = normalizeDomain(newDomain);
    if (!domain) return;

    if (!domain.includes('.')) {
      Alert.alert('無効なドメイン', '有効なドメイン名を入力してください（例: example.com）');
      return;
    }

    if (domains.includes(domain)) {
      Alert.alert('重複', 'このドメインは既に追加されています');
      return;
    }

    setIsAdding(true);
    const success = await contentBlockerBridge.addCustomDomain(domain);
    setIsAdding(false);

    if (success) {
      const updatedList = await contentBlockerBridge.getCustomDomains();
      setDomains(updatedList);
      setNewDomain('');
    } else {
      Alert.alert('エラー', 'ドメインの追加に失敗しました。Content Blockerが有効か確認してください。');
    }
  }, [newDomain, domains]);

  const handleRemove = useCallback(
    (domain: string) => {
      Alert.alert('ブロック解除', `「${domain}」のブロックを解除しますか？`, [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '解除',
          style: 'destructive',
          onPress: async () => {
            const success = await contentBlockerBridge.removeCustomDomain(domain);
            if (success) {
              setDomains((prev) => prev.filter((d) => d !== domain));
            }
          },
        },
      ]);
    },
    []
  );

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.domainRow}>
      <Ionicons name="ban-outline" size={18} color={COLORS.danger} style={styles.rowIcon} />
      <Text style={styles.domainText} numberOfLines={1}>{item}</Text>
      <TouchableOpacity
        onPress={() => handleRemove(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const canAdd = newDomain.trim().length > 0 && !isAdding;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Input row */}
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
          editable={!isAdding}
        />
        <TouchableOpacity
          style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!canAdd}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>追加</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Section header */}
      <Text style={styles.sectionLabel}>
        ブロック中のサイト ({domains.length})
      </Text>

      {/* Domain list */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={domains}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={domains.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>カスタムブロックなし</Text>
              <Text style={styles.emptyDescription}>
                ブロックしたいサイトのドメインを{'\n'}上の入力欄に入力してください
              </Text>
            </View>
          }
        />
      )}

      {/* Footer note */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.footerText}>
          プリセットリスト（約70,000サイト）は自動でブロックされています
        </Text>
      </View>
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
    marginBottom: SPACING.xl,
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
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rowIcon: {
    marginRight: SPACING.sm,
  },
  domainText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    flex: 1,
    marginRight: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  emptyDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    flex: 1,
  },
});
