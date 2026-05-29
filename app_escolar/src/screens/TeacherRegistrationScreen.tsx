import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { createTeacher, listTeachers } from '../services/academicService';
import { colors } from '../styles/colors';
import { Teacher } from '../types';

interface TeacherErrors {
  name: string;
  title: string;
  area: string;
  teachingTime: string;
  email: string;
}

const initialForm: Teacher = {
  name: '',
  title: '',
  area: '',
  teachingTime: '',
  email: '',
};

const initialErrors: TeacherErrors = {
  name: '',
  title: '',
  area: '',
  teachingTime: '',
  email: '',
};

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isTextFieldValid(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed) && !/^[\d\s\W_]+$/u.test(trimmed);
}

export default function TeacherRegistrationScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState<Teacher>(initialForm);
  const [errors, setErrors] = useState<TeacherErrors>(initialErrors);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadTeachers() {
    if (!token) return;
    try {
      const response = await listTeachers(token);
      setTeachers(response);
    } catch (error) {
      Alert.alert('Falha ao carregar professores', error instanceof Error ? error.message : 'Erro desconhecido.');
    }
  }

  useEffect(() => {
    loadTeachers();
  }, [token]);

  function updateField(field: keyof Teacher, value: string) {
    const nextValue = field === 'teachingTime' ? onlyNumbers(value) : value;

    setForm((prev) => ({ ...prev, [field]: nextValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm() {
    const nextErrors = { ...initialErrors };
    let valid = true;

    if (!isTextFieldValid(form.name)) {
      nextErrors.name = 'Informe um nome válido.';
      valid = false;
    }

    if (!isTextFieldValid(form.title)) {
      nextErrors.title = 'Informe uma titulação válida.';
      valid = false;
    }

    if (!isTextFieldValid(form.area)) {
      nextErrors.area = 'Informe uma área de atuação válida.';
      valid = false;
    }

    if (!/^\d+$/.test(form.teachingTime) || Number(form.teachingTime) <= 0) {
      nextErrors.teachingTime = 'Tempo de docência deve ser inteiro positivo.';
      valid = false;
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Informe um e-mail válido.';
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  }

  async function handleSubmit() {
    if (!token) return;
    if (!validateForm()) {
      Alert.alert('Cadastro inválido', 'Revise os campos destacados.');
      return;
    }

    try {
      setSubmitting(true);
      await createTeacher(form, token);
      Alert.alert('Professor cadastrado', 'Registro salvo no PostgreSQL.');
      setForm(initialForm);
      setErrors(initialErrors);
      await loadTeachers();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Erro desconhecido.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <SectionTitle
        title="Cadastro de Professores"
        subtitle="Acesso restrito ao administrador. Os dados alimentam as disciplinas e o login docente."
      />

      <View style={styles.card}>
        <AppInput label="Nome" placeholder="Nome completo" value={form.name} onChangeText={(text) => updateField('name', text)} error={errors.name} />
        <AppInput label="Titulação" placeholder="Ex.: Mestre" value={form.title} onChangeText={(text) => updateField('title', text)} error={errors.title} />
        <AppInput label="Área de atuação" placeholder="Ex.: Programação Mobile" value={form.area} onChangeText={(text) => updateField('area', text)} error={errors.area} />
        <AppInput label="Tempo de docência (anos)" placeholder="Ex.: 8" value={form.teachingTime} onChangeText={(text) => updateField('teachingTime', text)} error={errors.teachingTime} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="Email" placeholder="Digite o email" value={form.email} onChangeText={(text) => updateField('email', text)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
        <AppButton title="Salvar professor" onPress={handleSubmit} loading={submitting} />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Corpo docente</Text>
        <FlatList
          data={teachers}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.nome}</Text>
              <Text style={styles.rowText}>{item.titulacao} • {item.area}</Text>
              <Text style={styles.rowText}>Docência: {item.tempo_docencia} anos</Text>
              <Text style={styles.rowText}>{item.email}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum professor cadastrado ainda.</Text>}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  rowCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: colors.surfaceMuted,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  rowText: {
    color: colors.textLight,
    marginBottom: 2,
  },
  emptyText: {
    color: colors.textMuted,
  },
});
