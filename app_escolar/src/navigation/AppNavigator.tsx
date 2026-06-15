import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/colors';
import { RootStackParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import StudentRegistrationScreen from '../screens/StudentRegistrationScreen';
import TeacherRegistrationScreen from '../screens/TeacherRegistrationScreen';
import SubjectRegistrationScreen from '../screens/SubjectRegistrationScreen';
import ReportCardScreen from '../screens/ReportCardScreen';
import AcademicRecordsScreen from '../screens/AcademicRecordsScreen';
import StudentPortalScreen from '../screens/StudentPortalScreen';
import TeacherSubjectsScreen from '../screens/TeacherSubjectsScreen';
import TeacherSubjectStudentsScreen from '../screens/TeacherSubjectStudentsScreen';
import TeacherGradeEntryScreen from '../screens/TeacherGradeEntryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800', fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : user.profile === 'aluno' ? (
          <Stack.Screen name="StudentPortal" component={StudentPortalScreen} options={{ title: 'Área do Aluno' }} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'App Scholar' }} />
            <Stack.Screen name="StudentRegistration" component={StudentRegistrationScreen} options={{ title: 'Alunos' }} />
            <Stack.Screen name="TeacherRegistration" component={TeacherRegistrationScreen} options={{ title: 'Professores' }} />
            <Stack.Screen name="SubjectRegistration" component={SubjectRegistrationScreen} options={{ title: 'Disciplinas' }} />
            <Stack.Screen name="TeacherSubjects" component={TeacherSubjectsScreen} options={{ title: 'Módulo de Notas' }} />
            <Stack.Screen name="TeacherSubjectStudents" component={TeacherSubjectStudentsScreen} options={{ title: 'Alunos da Disciplina' }} />
            <Stack.Screen name="TeacherGradeEntry" component={TeacherGradeEntryScreen} options={{ title: 'Lançar Notas' }} />
            <Stack.Screen name="AcademicRecords" component={AcademicRecordsScreen} options={{ title: 'Notas e Faltas' }} />
            <Stack.Screen name="ReportCard" component={ReportCardScreen} options={{ title: 'Boletim' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
