import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import BoletimCard from '../components/BoletimCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { mockReportCard } from '../services/mockData';
import { ReportCardItem } from '../types';
import { colors } from '../styles/colors';

export default function ReportCardScreen() {
  const [items, setItems] = useState<ReportCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * useEffect obrigatório:
   * simula o carregamento inicial do boletim.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(mockReportCard);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    if (!items.length) {
      return {
        overallAverage: 0,
        approved: 0,
        recovery: 0,
        failed: 0,
      };
    }

    const overallAverage =
      items.reduce((acc, item) => acc + item.average, 0) / items.length;

    return {
      overallAverage,
      approved: items.filter((item) => item.status === 'Aprovado').length,
      recovery: items.filter((item) => item.status === 'Recuperação').length,
      failed: items.filter((item) => item.status === 'Reprovado').length,
    };
  }, [items]);

  return (
    <ScreenContainer>
      <SectionTitle
        title="Boletim Acadêmico"
        subtitle="Visualização organizada por disciplina, notas, média e situação."
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando dados simulados...</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo do Boletim</Text>
            <Text style={styles.summaryText}>
              Média geral: {summary.overallAverage.toFixed(2)}
            </Text>
            <Text style={styles.summaryText}>
              Aprovadas: {summary.approved}
            </Text>
            <Text style={styles.summaryText}>
              Em recuperação: {summary.recovery}
            </Text>
            <Text style={styles.summaryText}>
              Reprovadas: {summary.failed}
            </Text>
          </View>

          {items.map((item) => (
            <BoletimCard key={item.id} item={item} />
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textLight,
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  summaryText: {
    color: colors.text,
    marginBottom: 4,
    fontSize: 14,
  },
});