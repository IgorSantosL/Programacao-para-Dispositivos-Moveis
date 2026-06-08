import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { createSubject, listSubjects } from '../services/academicService';
import { colors } from '../styles/colors';
import { Subject } from '../types';

interface SubjectErrors {
  name: string;
  workload: string;
  course: string;
  semester: string;
}

const initialForm: Subject = {
  name: '',
  workload: '',
  teacher: '',
  teacherId: undefined,
  course: '',
  semester: '',
};

const initialErrors: SubjectErrors = {
  name: '',
  workload: '',
  course: '',
  semester: '',
};

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function isTextFieldValid(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed) && !/^[\d\s\W_]+$/u.test(trimmed);
}

export default function SubjectRegistrationScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState<Subject>(initialForm);
  const [errors, setErrors] = useState<SubjectErrors>(initialErrors);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadDependencies() {
    if (!token) return;

    try {
      const subjectsResponse = await listSubjects(token);
      setSubjects(subjectsResponse);
    } catch (error) {
      Alert.alert('Erro ao carregar dados', error instanceof Error ? error.message : 'Erro desconhecido.');
    }
  }

  useEffect(() => {
    loadDependencies();
  }, [token]);

  function updateField(field: keyof Subject, value: string) {
    const nextValue = field === 'workload' ? onlyNumbers(value) : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));

    if (errors[field as keyof SubjectErrors]) {
      setErrors((prev) => ({ ...prev, [field]: '' } as SubjectErrors));
    }
  }

  function validateForm() {
    const nextErrors = { ...initialErrors };
    let valid = true;

    if (!isTextFieldValid(form.name)) {
      nextErrors.name = 'Informe um nome de disciplina válido.';
      valid = false;
    }

    if (!/^\d+$/.test(form.workload) || Number(form.workload) <= 0) {
      nextErrors.workload = 'Carga horária deve ser um inteiro positivo.';
      valid = false;
    }

    if (!isTextFieldValid(form.course)) {
      nextErrors.course = 'Informe um curso válido.';
      valid = false;
    }

    if (!/^\d{1,2}\s*º?\s*semestre$/i.test(form.semester.trim())) {
      nextErrors.semester = 'Use um formato como 1º Semestre.';
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
      await createSubject(form, token);
      Alert.alert('Disciplina cadastrada', 'Registro salvo com sucesso. Agora ela poderá ser vinculada a um professor no cadastro docente.');
      setForm(initialForm);
      setErrors(initialErrors);
      await loadDependencies();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Erro desconhecido.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <SectionTitle
        title="Cadastro de Disciplinas"
        subtitle="As disciplinas são criadas primeiro. Depois, o administrador vincula um professor a cada disciplina disponível."
      />

      <View style={styles.card}>
        <AppInput label="Nome da disciplina" placeholder="Ex.: Programação Mobile" value={form.name} onChangeText={(text) => updateField('name', text)} error={errors.name} />
        <AppInput label="Carga horária" placeholder="Ex.: 80" value={form.workload} onChangeText={(text) => updateField('workload', text)} error={errors.workload} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="Curso" placeholder="Ex.: ADS" value={form.course} onChangeText={(text) => updateField('course', text)} error={errors.course} />
        <AppInput label="Semestre" placeholder="Ex.: 2º Semestre" value={form.semester} onChangeText={(text) => updateField('semester', text)} error={errors.semester} />
        <AppButton title="Salvar disciplina" onPress={handleSubmit} loading={submitting} />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Disciplinas cadastradas</Text>
        <FlatList
          data={subjects}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.nome}</Text>
              <Text style={styles.rowText}>Professor: {item.professor_nome || 'Ainda não vinculado'}</Text>
              <Text style={styles.rowText}>Curso: {item.curso}</Text>
              <Text style={styles.rowText}>Semestre: {item.semestre} • {item.carga_horaria}h</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma disciplina cadastrada ainda.</Text>}
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
