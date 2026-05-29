import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import {
  listAcademicRecords,
  listStudents,
  listSubjects,
  saveAcademicRecord,
} from '../services/academicService';
import { colors } from '../styles/colors';
import { AcademicRecordForm, AcademicRecordRow } from '../types';

const initialForm: AcademicRecordForm = {
  studentId: '',
  subjectId: '',
  grade1: '',
  grade2: '',
  absences: '',
  totalClasses: '',
};

interface FormErrors {
  studentId: string;
  subjectId: string;
  grade1: string;
  grade2: string;
  absences: string;
  totalClasses: string;
}

const initialErrors: FormErrors = {
  studentId: '',
  subjectId: '',
  grade1: '',
  grade2: '',
  absences: '',
  totalClasses: '',
};

function normalizeNumberInput(value: string) {
  return value.replace(',', '.').replace(/[^\d.]/g, '');
}

function toNumber(value: string) {
  return Number(value.replace(',', '.'));
}

export default function AcademicRecordsScreen() {
  const { token, user } = useAuth();
  const [form, setForm] = useState<AcademicRecordForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [records, setRecords] = useState<AcademicRecordRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadDependencies() {
    if (!token) return;

    try {
      const [studentsResponse, subjectsResponse, recordsResponse] = await Promise.all([
        listStudents(token),
        listSubjects(token),
        listAcademicRecords(token),
      ]);

      setStudents(studentsResponse);
      setSubjects(subjectsResponse);
      setRecords(recordsResponse);
    } catch (error) {
      Alert.alert('Falha ao carregar dados', error instanceof Error ? error.message : 'Erro desconhecido.');
    }
  }

  useEffect(() => {
    loadDependencies();
  }, [token]);

  function updateField(field: keyof AcademicRecordForm, value: string) {
    let nextValue = value;

    if (field === 'grade1' || field === 'grade2') {
      nextValue = normalizeNumberInput(value);
    }

    if (field === 'absences' || field === 'totalClasses') {
      nextValue = value.replace(/\D/g, '');
    }

    setForm((prev) => ({ ...prev, [field]: nextValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm() {
    const nextErrors = { ...initialErrors };
    let valid = true;

    const grade1 = toNumber(form.grade1);
    const grade2 = toNumber(form.grade2);
    const absences = Number(form.absences);
    const totalClasses = Number(form.totalClasses);

    if (!form.studentId) {
      nextErrors.studentId = 'Selecione um aluno.';
      valid = false;
    }

    if (!form.subjectId) {
      nextErrors.subjectId = 'Selecione uma disciplina.';
      valid = false;
    }

    if (Number.isNaN(grade1) || grade1 < 0 || grade1 > 10) {
      nextErrors.grade1 = 'A nota 1 deve ficar entre 0 e 10.';
      valid = false;
    }

    if (Number.isNaN(grade2) || grade2 < 0 || grade2 > 10) {
      nextErrors.grade2 = 'A nota 2 deve ficar entre 0 e 10.';
      valid = false;
    }

    if (!/^\d+$/.test(form.absences)) {
      nextErrors.absences = 'Informe as faltas como inteiro.';
      valid = false;
    }

    if (!/^\d+$/.test(form.totalClasses) || totalClasses <= 0) {
      nextErrors.totalClasses = 'Total de aulas deve ser inteiro positivo.';
      valid = false;
    }

    if (!Number.isNaN(absences) && !Number.isNaN(totalClasses) && absences > totalClasses) {
      nextErrors.absences = 'Faltas não podem ser maiores que o total de aulas.';
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  }

  async function handleSubmit() {
    if (!token) return;

    if (!validateForm()) {
      Alert.alert('Lançamento inválido', 'Revise notas e faltas informadas.');
      return;
    }

    try {
      setSubmitting(true);
      await saveAcademicRecord(
        {
          aluno_id: Number(form.studentId),
          disciplina_id: Number(form.subjectId),
          nota1: toNumber(form.grade1),
          nota2: toNumber(form.grade2),
          faltas: Number(form.absences),
          total_aulas: Number(form.totalClasses),
        },
        token
      );

      Alert.alert('Lançamento salvo', 'Notas e faltas registradas com sucesso.');
      setForm(initialForm);
      setErrors(initialErrors);
      await loadDependencies();
    } catch (error) {
      Alert.alert('Erro ao salvar', error instanceof Error ? error.message : 'Erro desconhecido.');
    } finally {
      setSubmitting(false);
    }
  }

  const studentOptions = useMemo(
    () => students.map((item) => ({ label: `${item.nome} • ${item.matricula}`, value: String(item.id) })),
    [students]
  );

  const subjectOptions = useMemo(
    () => subjects.map((item) => ({ label: `${item.nome} • ${item.professor_nome}`, value: String(item.id) })),
    [subjects]
  );

  return (
    <ScreenContainer>
      <SectionTitle
        title="Lançamento de Notas e Faltas"
        subtitle={`Usuário logado: ${user?.profile === 'admin' ? 'Administrador' : 'Professor'}. As médias são calculadas no backend.`}
      />

      <View style={styles.card}>
        <SelectField
          label="Aluno"
          placeholder="Selecione o aluno"
          value={students.find((item) => String(item.id) === form.studentId)?.nome || ''}
          options={studentOptions}
          onSelect={(value) => updateField('studentId', value)}
          error={errors.studentId}
        />

        <SelectField
          label="Disciplina"
          placeholder="Selecione a disciplina"
          value={subjects.find((item) => String(item.id) === form.subjectId)?.nome || ''}
          options={subjectOptions}
          onSelect={(value) => updateField('subjectId', value)}
          error={errors.subjectId}
        />

        <AppInput label="Nota 1" placeholder="0 a 10" value={form.grade1} onChangeText={(text) => updateField('grade1', text)} error={errors.grade1} keyboardType="decimal-pad" autoCapitalize="none" />
        <AppInput label="Nota 2" placeholder="0 a 10" value={form.grade2} onChangeText={(text) => updateField('grade2', text)} error={errors.grade2} keyboardType="decimal-pad" autoCapitalize="none" />
        <AppInput label="Faltas" placeholder="Ex.: 3" value={form.absences} onChangeText={(text) => updateField('absences', text)} error={errors.absences} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="Total de aulas" placeholder="Ex.: 40" value={form.totalClasses} onChangeText={(text) => updateField('totalClasses', text)} error={errors.totalClasses} keyboardType="number-pad" autoCapitalize="none" />

        <AppButton title="Salvar lançamento" onPress={handleSubmit} loading={submitting} />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Últimos lançamentos</Text>
        <FlatList
          data={records}
          keyExtractor={(item) => `${item.aluno_id}-${item.disciplina_id}`}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.aluno_nome} • {item.disciplina_nome}</Text>
              <Text style={styles.rowText}>Professor: {item.professor_nome}</Text>
              <Text style={styles.rowText}>Notas: {item.nota1} / {item.nota2} • Média: {item.media}</Text>
              <Text style={styles.rowText}>Situação: {item.situacao}</Text>
              <Text style={styles.rowText}>Faltas: {item.faltas} de {item.total_aulas}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum lançamento encontrado.</Text>}
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
