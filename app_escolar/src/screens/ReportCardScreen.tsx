import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import BoletimCard from '../components/BoletimCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { getReportCardByRegistration } from '../services/academicService';
import { colors } from '../styles/colors';
import { ReportCardItem, ReportCardResponse } from '../types';

export default function ReportCardScreen() {
  const { token } = useAuth();
  const [registration, setRegistration] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportCardResponse | null>(null);
  const [error, setError] = useState('');

  const items = useMemo<ReportCardItem[]>(() => {
    if (!report) return [];
    return report.disciplinas.map((item, index) => ({
      id: index + 1,
      discipline: item.disciplina,
      grade1: item.nota1,
      grade2: item.nota2,
      average: item.media,
      status: item.situacao,
      absences: item.faltas,
      totalClasses: item.totalAulas,
    }));
  }, [report]);

  const summary = useMemo(() => {
    if (!items.length) {
      return {
        overallAverage: 0,
        approved: 0,
        recovery: 0,
        failed: 0,
      };
    }

    return {
      overallAverage: items.reduce((acc, item) => acc + item.average, 0) / items.length,
      approved: items.filter((item) => item.status === 'Aprovado').length,
      recovery: items.filter((item) => item.status === 'Recuperação').length,
      failed: items.filter((item) => item.status === 'Reprovado').length,
    };
  }, [items]);

  async function handleSearch() {
    if (!token) return;

    if (!registration.trim()) {
      setError('Informe a matrícula do aluno.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getReportCardByRegistration(registration.trim(), token);
      setReport(response);
    } catch (err) {
      setReport(null);
      Alert.alert('Boletim não encontrado', err instanceof Error ? err.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <SectionTitle
        title="Consulta de Boletim"
        subtitle="Digite a matrícula do aluno para consultar disciplinas, médias, situação e frequência."
      />

      <View style={styles.filterCard}>
        <AppInput
          label="Matrícula"
          placeholder="Digite a matrícula"
          value={registration}
          onChangeText={(text) => {
            setRegistration(text.replace(/\D/g, ''));
            if (error) setError('');
          }}
          error={error}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <AppButton title="Buscar boletim" onPress={handleSearch} loading={loading} />
      </View>

      {report ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{report.aluno}</Text>
            <Text style={styles.summaryText}>Matrícula: {report.matricula}</Text>
            <Text style={styles.summaryText}>Curso: {report.curso}</Text>
            <Text style={styles.summaryText}>Média geral: {summary.overallAverage.toFixed(2)}</Text>
            <Text style={styles.summaryText}>Aprovadas: {summary.approved}</Text>
            <Text style={styles.summaryText}>Recuperação: {summary.recovery}</Text>
            <Text style={styles.summaryText}>Reprovadas: {summary.failed}</Text>
          </View>

          {items.map((item) => (
            <BoletimCard key={item.id} item={item} />
          ))}
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum boletim carregado</Text>
          <Text style={styles.emptyText}>
            Faça uma busca após lançar notas e faltas no backend.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: '#FFF2F2',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3C1C1',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  summaryText: {
    color: colors.text,
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textLight,
    lineHeight: 20,
  },
});
