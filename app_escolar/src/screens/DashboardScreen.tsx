import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import SideMenu from '../components/SideMenu';
import StatCard from '../components/StatCard';
import SummaryListModal, { SummaryListItem } from '../components/SummaryListModal';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import {
  getDashboardSummary,
  listAcademicRecords,
  listStudents,
  listSubjects,
  listTeachers,
} from '../services/academicService';
import { colors } from '../styles/colors';
import { DashboardSummary } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

type ListType = 'students' | 'teachers' | 'subjects' | 'records' | null;

const emptySummary: DashboardSummary = {
  students: 0,
  teachers: 0,
  subjects: 0,
  records: 0,
};

export default function DashboardScreen({ navigation }: Props) {
  const { user, token, signOut } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [menuOpen, setMenuOpen] = useState(false);
  const [listType, setListType] = useState<ListType>(null);
  const [listTitle, setListTitle] = useState('');
  const [listItems, setListItems] = useState<SummaryListItem[]>([]);
  const [listEmptyMessage, setListEmptyMessage] = useState('Nenhum item encontrado.');

  const isAdmin = user?.profile === 'admin';
  const isProfessor = user?.profile === 'professor';

  const loadSummary = useCallback(async () => {
    if (!token) return;

    try {
      const response = await getDashboardSummary(token);
      setSummary(response);
    } catch (error) {
      Alert.alert(
        'Resumo indisponível',
        error instanceof Error ? error.message : 'Falha ao carregar indicadores.'
      );
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary])
  );

  function handleLogout() {
    Alert.alert('Sair do App', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  const menuItems = useMemo(() => {
    const items = [
      { label: 'Início', onPress: () => navigation.navigate('Dashboard') },
      ...(isAdmin
        ? [{ label: 'Cadastro de Alunos', onPress: () => navigation.navigate('StudentRegistration') }]
        : []),
      ...(isAdmin
        ? [{ label: 'Cadastro de Professores', onPress: () => navigation.navigate('TeacherRegistration') }]
        : []),
      ...(isAdmin
        ? [{ label: 'Cadastro de Disciplinas', onPress: () => navigation.navigate('SubjectRegistration') }]
        : []),
      ...(isAdmin || isProfessor
        ? [{ label: 'Notas e Faltas', onPress: () => navigation.navigate('AcademicRecords') }]
        : []),
      { label: 'Consulta de Boletim', onPress: () => navigation.navigate('ReportCard') },
    ];

    return items;
  }, [isAdmin, isProfessor, navigation]);

  async function openSummaryList(type: Exclude<ListType, null>) {
    if (!token) return;

    try {
      if (type === 'students') {
        const students = await listStudents(token);
        setListTitle('Alunos cadastrados');
        setListEmptyMessage('Nenhum aluno cadastrado até o momento.');
        setListItems(
          students.map((student) => ({
            id: student.id,
            title: student.nome,
            subtitle: `Matrícula: ${student.matricula} • Curso: ${student.curso}`,
            meta: `${student.email} • ${student.telefone}`,
          }))
        );
      }

      if (type === 'teachers') {
        const teachers = await listTeachers(token);
        setListTitle('Professores cadastrados');
        setListEmptyMessage('Nenhum professor cadastrado até o momento.');
        setListItems(
          teachers.map((teacher) => ({
            id: teacher.id,
            title: teacher.nome,
            subtitle: `${teacher.titulacao} • ${teacher.area}`,
            meta: `${teacher.email} • ${teacher.tempo_docencia} ano(s) de docência`,
          }))
        );
      }

      if (type === 'subjects') {
        const subjects = await listSubjects(token);
        setListTitle('Disciplinas cadastradas');
        setListEmptyMessage('Nenhuma disciplina cadastrada até o momento.');
        setListItems(
          subjects.map((subject) => ({
            id: subject.id,
            title: subject.nome,
            subtitle: `${subject.curso} • ${subject.semestre}`,
            meta: `Professor: ${subject.professor_nome || 'Não informado'} • ${subject.carga_horaria}h`,
          }))
        );
      }

      if (type === 'records') {
        const records = await listAcademicRecords(token);
        setListTitle('Lançamentos de notas e faltas');
        setListEmptyMessage('Nenhum lançamento foi registrado até o momento.');
        setListItems(
          records.map((record, index) => ({
            id: `${record.aluno_id}-${record.disciplina_id}-${index}`,
            title: `${record.aluno_nome} • ${record.disciplina_nome}`,
            subtitle: `Média: ${record.media} • Situação: ${record.situacao}`,
            meta: `Nota 1: ${record.nota1} • Nota 2: ${record.nota2} • Faltas: ${record.faltas}/${record.total_aulas}`,
          }))
        );
      }

      setListType(type);
    } catch (error) {
      Alert.alert(
        'Lista indisponível',
        error instanceof Error ? error.message : 'Não foi possível carregar os dados agora.'
      );
    }
  }

  function closeListModal() {
    setListType(null);
  }

  return (
    <>
      <SideMenu
        visible={menuOpen}
        title="Menu acadêmico"
        subtitle={`Acesso ${user?.profile === 'admin' ? 'administrativo' : 'docente'} disponível.`}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />

      <SummaryListModal
        visible={listType !== null}
        title={listTitle}
        emptyMessage={listEmptyMessage}
        items={listItems}
        onClose={closeListModal}
      />

      <ScreenContainer>
        <View style={styles.content}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen((current) => !current)}>
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>

            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {user?.profile === 'admin' ? 'Administrador' : 'Professor'}
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Portal acadêmico</Text>
            <Text style={styles.heroTitle}>Olá, {user?.name}</Text>
            <Text style={styles.heroDescription}>
              {isAdmin
                ? 'Você pode cadastrar alunos, professores, disciplinas e lançar notas e faltas.'
                : 'Você pode lançar notas, faltas e consultar boletins dos alunos vinculados ao ambiente.'}
            </Text>
          </View>

          <SectionTitle
            title="Indicadores rápidos"
            subtitle="Toque em um indicador para visualizar os registros salvos no PostgreSQL."
          />

          <View style={styles.statsGrid}>
            <StatCard
              label="Alunos"
              value={summary.students}
              hint="Cadastros ativos"
              onPress={() => openSummaryList('students')}
            />
            <StatCard
              label="Professores"
              value={summary.teachers}
              hint="Equipe docente"
              onPress={() => openSummaryList('teachers')}
            />
            <StatCard
              label="Disciplinas"
              value={summary.subjects}
              hint="Ofertas cadastradas"
              onPress={() => openSummaryList('subjects')}
            />
            <StatCard
              label="Lançamentos"
              value={summary.records}
              hint="Notas e faltas"
              onPress={() => openSummaryList('records')}
            />
          </View>

          <View style={styles.logoutContainer}>
            <AppButton title="Sair do App" onPress={handleLogout} variant="danger" />
          </View>
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '900',
  },
  profileBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F3C1C1',
  },
  profileBadgeText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  heroCard: {
    marginTop: 16,
    marginBottom: 22,
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 24,
  },
  heroEyebrow: {
    color: '#FFE4E4',
    textTransform: 'uppercase',
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 12,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroDescription: {
    color: '#FFEAEA',
    lineHeight: 22,
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  logoutContainer: {
    marginTop: 18,
    marginBottom: 14,
  },
});
