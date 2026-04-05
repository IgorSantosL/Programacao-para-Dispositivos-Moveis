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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 20,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'App Scholar' }}
            />
            <Stack.Screen
              name="StudentRegistration"
              component={StudentRegistrationScreen}
              options={{ title: 'Cadastro de Alunos' }}
            />
            <Stack.Screen
              name="TeacherRegistration"
              component={TeacherRegistrationScreen}
              options={{ title: 'Cadastro de Professores' }}
            />
            <Stack.Screen
              name="SubjectRegistration"
              component={SubjectRegistrationScreen}
              options={{ title: 'Cadastro de Disciplinas' }}
            />
            <Stack.Screen
              name="ReportCard"
              component={ReportCardScreen}
              options={{ title: 'Consulta de Boletim' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}