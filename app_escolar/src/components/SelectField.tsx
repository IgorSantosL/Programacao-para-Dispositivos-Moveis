import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../styles/colors';

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  error?: string;
}

export default function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={() => setVisible(true)}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Text style={styles.closeText}>Fechar</Text>
              </Pressable>
            </View>

            <TextInput
              placeholder="Buscar..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.map((option) => (
                <Pressable
                  key={`${option.value}-${option.label}`}
                  style={styles.option}
                  onPress={() => {
                    onSelect(option.value);
                    setVisible(false);
                    setQuery('');
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              ))}

              {!filtered.length ? (
                <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selector: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorError: {
    borderColor: colors.danger,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    color: colors.textMuted,
    flex: 1,
  },
  chevron: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 8,
  },
  error: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  closeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  searchInput: {
    marginTop: 16,
    marginBottom: 14,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    paddingVertical: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
