import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  onPress?: () => void;
}

export default function StatCard({ label, value, hint, onPress }: StatCardProps) {
  const content = (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {onPress ? <Text style={styles.link}>Toque para visualizar</Text> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable style={({ pressed }) => [styles.wrapper, pressed && styles.wrapperPressed]} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexBasis: '48%',
    marginBottom: 14,
  },
  wrapperPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    minHeight: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    marginTop: 12,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
});
