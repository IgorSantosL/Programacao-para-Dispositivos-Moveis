import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReportCardItem } from '../types';
import { colors } from '../styles/colors';

interface BoletimCardProps {
  item: ReportCardItem;
}

export default function BoletimCard({ item }: BoletimCardProps) {
  const statusColor =
    item.status === 'Aprovado'
      ? colors.success
      : item.status === 'Recuperação'
      ? colors.warning
      : colors.danger;

  return (
    <View style={styles.card}>
      <Text style={styles.discipline}>{item.discipline}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Nota 1:</Text>
        <Text style={styles.value}>{item.grade1.toFixed(1)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Nota 2:</Text>
        <Text style={styles.value}>{item.grade2.toFixed(1)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Média:</Text>
        <Text style={styles.value}>{item.average.toFixed(1)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[styles.status, { color: statusColor }]}>{item.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discipline: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: colors.textLight,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  status: {
    fontWeight: '700',
    fontSize: 14,
  },
});