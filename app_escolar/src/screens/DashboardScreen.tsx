import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import DashboardCard from '../components/DashboardCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  function handleLogout() {
    Alert.alert('Sair do App', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScreenContainer>
      <View style={styles.headerCard}>
        <Text style={styles.welcomeLabel}>Bem-vindo</Text>
        <Text style={styles.welcomeName}>
          Olá, {user?.name ?? 'Usuário'}
        </Text>
        <Text style={styles.welcomeDescription}>
          Escolha uma das opções abaixo para navegar pelo sistema acadêmico.
        </Text>
      </View>

      <SectionTitle
        title="Acessos rápidos"
        subtitle="Selecione uma funcionalidade para continuar."
      />

      <DashboardCard
        title="Cadastro de Alunos"
        description="Cadastrar nome, matrícula, curso, email, telefone e endereço do aluno."
        onPress={() => navigation.navigate('StudentRegistration')}
      />

      <DashboardCard
        title="Cadastro de Professores"
        description="Cadastrar titulação, área de atuação, tempo de docência e email."
        onPress={() => navigation.navigate('TeacherRegistration')}
      />

      <DashboardCard
        title="Cadastro de Disciplinas"
        description="Cadastrar nome da disciplina, carga horária, professor responsável, curso e semestre."
        onPress={() => navigation.navigate('SubjectRegistration')}
      />

      <DashboardCard
        title="Consulta de Boletim"
        description="Visualizar disciplinas, notas, média final e situação acadêmica do aluno."
        onPress={() => navigation.navigate('ReportCard')}
      />

      <View style={styles.logoutContainer}>
        <AppButton
          title="Sair do App"
          onPress={handleLogout}
          variant="danger"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  welcomeName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 38,
    marginBottom: 10,
  },
  welcomeDescription: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textLight,
    fontWeight: '500',
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
});