import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import BoletimCard from '../components/BoletimCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { getReportCardByRegistration } from '../services/academicService';
import { colors } from '../styles/colors';
import { ReportCardItem, ReportCardResponse } from '../types';

export default function StudentPortalScreen() {
  const { token, user, signOut } = useAuth();
  const [report, setReport] = useState<ReportCardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = useCallback(async () => {
    if (!token || !user?.registration) return;
    try {
      setLoading(true);
      const response = await getReportCardByRegistration(user.registration, token);
      setReport(response);
    } catch (error) {
      Alert.alert('Falha ao carregar portal do aluno', error instanceof Error ? error.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.registration]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport])
  );

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

  const average = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((acc, item) => acc + item.average, 0) / items.length;
  }, [items]);

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.badge}>Portal do aluno</Text>
        <Text style={styles.title}>Olá, {user?.name}</Text>
        <Text style={styles.subtitle}>Matrícula: {user?.registration || '-'} • Curso: {user?.course || '-'}</Text>
      </View>

      <SectionTitle title="Minhas disciplinas" subtitle="Aqui você acompanha suas notas, faltas, médias e situação em cada matéria." />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo acadêmico</Text>
        <Text style={styles.summaryText}>Disciplinas cadastradas: {items.length}</Text>
        <Text style={styles.summaryText}>Média geral: {average.toFixed(2)}</Text>
        {loading ? <Text style={styles.summaryText}>Atualizando dados...</Text> : null}
      </View>

      {items.map((item) => <BoletimCard key={item.id} item={item} />)}

      <AppButton title="Sair do App" onPress={signOut} variant="danger" style={styles.logoutButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
  },
  badge: {
    color: '#FFEAEA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFEAEA',
    lineHeight: 22,
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
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  summaryText: {
    color: colors.text,
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 12,
    marginBottom: 14,
  },
});
