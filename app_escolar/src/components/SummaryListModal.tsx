import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

export interface SummaryListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  meta?: string;
}

interface SummaryListModalProps {
  visible: boolean;
  title: string;
  emptyMessage: string;
  items: SummaryListItem[];
  onClose: () => void;
}

export default function SummaryListModal({
  visible,
  title,
  emptyMessage,
  items,
  onClose,
}: SummaryListModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.closeIcon} onPress={onClose}>
              <Text style={styles.closeIconText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {items.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={String(item.id)} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
                  {item.meta ? <Text style={styles.itemMeta}>{item.meta}</Text> : null}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: '72%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  closeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FCEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  emptyBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: 18,
  },
  emptyText: {
    color: colors.textLight,
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  itemTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  itemSubtitle: {
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 4,
  },
  itemMeta: {
    color: colors.primaryDark,
    fontWeight: '700',
    lineHeight: 20,
  },
});
