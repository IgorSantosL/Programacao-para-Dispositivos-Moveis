import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import { listTeacherSubjectsForGrades } from '../services/academicService';
import { colors } from '../styles/colors';
import { ProfessorSubjectSummary } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherSubjects'>;

export default function TeacherSubjectsScreen({ navigation }: Props) {
  const { token, user } = useAuth();
  const [subjects, setSubjects] = useState<ProfessorSubjectSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSubjects = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await listTeacherSubjectsForGrades(token);
      setSubjects(response);
    } catch (error) {
      Alert.alert('Erro ao carregar disciplinas', error instanceof Error ? error.message : 'Falha inesperada.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [loadSubjects])
  );

  return (
    <ScreenContainer>
      <SectionTitle
        title={user?.profile === 'professor' ? 'Minhas disciplinas' : 'Disciplinas para lançamento'}
        subtitle="Selecione uma disciplina para ver os alunos vinculados e lançar ou alterar notas diretamente no banco."
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Como funciona o módulo</Text>
        <Text style={styles.infoText}>1. Escolha a disciplina.</Text>
        <Text style={styles.infoText}>2. Escolha um aluno matriculado nela.</Text>
        <Text style={styles.infoText}>3. Lance ou altere as notas.</Text>
        <Text style={styles.infoText}>4. O boletim passa a refletir os novos valores automaticamente.</Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{loading ? 'Carregando disciplinas...' : 'Nenhuma disciplina disponível'}</Text>
            <Text style={styles.emptyText}>
              {loading
                ? 'Aguarde alguns instantes.'
                : user?.profile === 'professor'
                ? 'Não há disciplinas vinculadas ao professor autenticado.'
                : 'Cadastre disciplinas e professores para começar o módulo.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              navigation.navigate('TeacherSubjectStudents', {
                subjectId: item.id,
                subjectName: item.nome,
                course: item.curso,
                semester: item.semestre,
                teacherName: item.professor_nome,
              })
            }
          >
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.curso} • {item.semestre}</Text>
            <Text style={styles.cardText}>Professor: {item.professor_nome || 'Não vinculado'}</Text>
            <Text style={styles.cardText}>Alunos vinculados: {item.total_alunos}</Text>
            <Text style={styles.cardText}>Média atual da turma: {Number(item.media_turma || 0).toFixed(2)}</Text>
            <Text style={styles.cardLink}>Abrir alunos da disciplina</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F3C1C1',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  infoTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 8,
  },
  infoText: {
    color: colors.text,
    lineHeight: 21,
    marginBottom: 3,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 6,
  },
  cardSubtitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    color: colors.textLight,
    marginBottom: 3,
  },
  cardLink: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textLight,
    lineHeight: 20,
  },
});
