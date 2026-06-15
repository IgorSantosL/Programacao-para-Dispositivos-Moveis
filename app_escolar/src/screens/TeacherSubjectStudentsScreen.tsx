import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import { listStudentsByTeacherSubject } from '../services/academicService';
import { colors } from '../styles/colors';
import { ProfessorDisciplineStudent } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherSubjectStudents'>;

export default function TeacherSubjectStudentsScreen({ route, navigation }: Props) {
  const { subjectId, subjectName, course, semester, teacherName } = route.params;
  const { token } = useAuth();
  const [students, setStudents] = useState<ProfessorDisciplineStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await listStudentsByTeacherSubject(subjectId, token);
      setStudents(response);
    } catch (error) {
      Alert.alert('Erro ao carregar alunos', error instanceof Error ? error.message : 'Falha inesperada.');
    } finally {
      setLoading(false);
    }
  }, [subjectId, token]);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  return (
    <ScreenContainer>
      <SectionTitle
        title={subjectName}
        subtitle={`Curso: ${course} • ${semester}${teacherName ? ` • Professor: ${teacherName}` : ''}`}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Alunos vinculados</Text>
        <Text style={styles.summaryText}>Total de alunos na disciplina: {students.length}</Text>
        <Text style={styles.summaryText}>Toque em um aluno para lançar ou alterar as notas dele.</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{loading ? 'Carregando alunos...' : 'Nenhum aluno vinculado'}</Text>
            <Text style={styles.emptyText}>
              {loading ? 'Aguarde alguns instantes.' : 'Vincule alunos a esta disciplina para começar os lançamentos.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              navigation.navigate('TeacherGradeEntry', {
                subjectId,
                subjectName,
                studentId: item.id,
                studentName: item.nome,
                registration: String(item.matricula),
              })
            }
          >
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardText}>Matrícula: {item.matricula}</Text>
            <Text style={styles.cardText}>Curso: {item.curso}</Text>
            <Text style={styles.cardText}>Nota atual: {item.media !== null ? `${item.nota1 ?? '-'} / ${item.nota2 ?? '-'} • Média ${item.media}` : 'Sem notas lançadas'}</Text>
            <Text style={styles.cardText}>Situação: {item.situacao || 'Ainda não calculada'}</Text>
            <Text style={styles.cardLink}>Abrir formulário de notas</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F3C1C1',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  summaryTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 8,
  },
  summaryText: {
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
    marginBottom: 8,
  },
  cardText: {
    color: colors.textLight,
    marginBottom: 4,
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
