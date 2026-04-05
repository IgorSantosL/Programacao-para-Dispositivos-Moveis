import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { mockCourses, mockSemesters, mockTeachers } from '../services/mockData';
import { Subject } from '../types';
import { colors } from '../styles/colors';

interface SubjectErrors {
  name: string;
  workload: string;
  teacher: string;
  course: string;
  semester: string;
}

const initialForm: Subject = {
  name: '',
  workload: '',
  teacher: '',
  course: '',
  semester: '',
};

const initialErrors: SubjectErrors = {
  name: '',
  workload: '',
  teacher: '',
  course: '',
  semester: '',
};

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function isTextFieldValid(value: string) {
  const trimmed = value.trim();

  if (trimmed.length < 2) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed)) return false;
  if (/^[\d\s\W_]+$/u.test(trimmed)) return false;

  return true;
}

function isValidSemester(value: string) {
  const trimmed = value.trim();

  // Aceita padrão tipo "1º Semestre", "2 Semestre", "3 semestre"
  return /^\d{1,2}\s*º?\s*semestre$/i.test(trimmed);
}

export default function SubjectRegistrationScreen() {
  const [form, setForm] = useState<Subject>(initialForm);
  const [errors, setErrors] = useState<SubjectErrors>(initialErrors);
  const [teacherSuggestions, setTeacherSuggestions] = useState<string[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<string[]>([]);
  const [semesterSuggestions, setSemesterSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setTeacherSuggestions(mockTeachers.map((teacher) => teacher.name));
    setCourseSuggestions(mockCourses);
    setSemesterSuggestions(mockSemesters);
  }, []);

  function updateField(field: keyof Subject, value: string) {
    let sanitizedValue = value;

    if (field === 'workload') {
      sanitizedValue = onlyNumbers(value);
    }

    setForm((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  }

  function validateForm() {
    const newErrors = { ...initialErrors };
    let valid = true;

    if (!isTextFieldValid(form.name)) {
      newErrors.name = 'Informe um nome de disciplina válido.';
      valid = false;
    }

    if (!/^\d+$/.test(form.workload.trim()) || Number(form.workload) <= 0) {
      newErrors.workload = 'A carga horária deve ser um número inteiro positivo.';
      valid = false;
    }

    if (!isTextFieldValid(form.teacher)) {
      newErrors.teacher = 'Informe um professor responsável válido.';
      valid = false;
    }

    if (!isTextFieldValid(form.course)) {
      newErrors.course = 'Informe um curso válido.';
      valid = false;
    }

    if (!isValidSemester(form.semester)) {
      newErrors.semester = 'Informe um semestre válido, como 1º Semestre.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function handleSubmit() {
    if (!validateForm()) {
      Alert.alert(
        'Cadastro inválido',
        'Revise os campos e corrija os dados antes de continuar.'
      );
      return;
    }

    const subjectToSave = {
      name: form.name.trim(),
      workload: Number(form.workload),
      teacher: form.teacher.trim(),
      course: form.course.trim(),
      semester: form.semester.trim(),
    };

    console.log('Disciplina cadastrada:', subjectToSave);

    Alert.alert(
      'Sucesso',
      'Disciplina cadastrada com validação segura. Nesta etapa, os dados continuam simulados.'
    );

    setForm(initialForm);
    setErrors(initialErrors);
  }

  return (
    <ScreenContainer>
      <SectionTitle
        title="Cadastro de Disciplinas"
        subtitle="Preencha dados válidos. A carga horária aceita apenas número inteiro."
      />

      <View style={styles.card}>
        <AppInput
          label="Nome da disciplina"
          placeholder="Digite o nome da disciplina"
          value={form.name}
          onChangeText={(text) => updateField('name', text)}
          error={errors.name}
        />

        <AppInput
          label="Carga horária"
          placeholder="Ex.: 80"
          value={form.workload}
          onChangeText={(text) => updateField('workload', text)}
          error={errors.workload}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <AppInput
          label="Professor responsável"
          placeholder="Digite o nome do professor"
          value={form.teacher}
          onChangeText={(text) => updateField('teacher', text)}
          error={errors.teacher}
        />

        <Text style={styles.chipTitle}>Sugestões de professores:</Text>
        <View style={styles.chipContainer}>
          {teacherSuggestions.map((teacher) => (
            <Pressable
              key={teacher}
              style={styles.chip}
              onPress={() => updateField('teacher', teacher)}
            >
              <Text style={styles.chipText}>{teacher}</Text>
            </Pressable>
          ))}
        </View>

        <AppInput
          label="Curso"
          placeholder="Digite o curso"
          value={form.course}
          onChangeText={(text) => updateField('course', text)}
          error={errors.course}
        />

        <Text style={styles.chipTitle}>Sugestões de cursos:</Text>
        <View style={styles.chipContainer}>
          {courseSuggestions.map((course) => (
            <Pressable
              key={course}
              style={styles.chip}
              onPress={() => updateField('course', course)}
            >
              <Text style={styles.chipText}>{course}</Text>
            </Pressable>
          ))}
        </View>

        <AppInput
          label="Semestre"
          placeholder="Ex.: 1º Semestre"
          value={form.semester}
          onChangeText={(text) => updateField('semester', text)}
          error={errors.semester}
        />

        <Text style={styles.chipTitle}>Sugestões de semestre:</Text>
        <View style={styles.chipContainer}>
          {semesterSuggestions.map((semester) => (
            <Pressable
              key={semester}
              style={styles.chip}
              onPress={() => updateField('semester', semester)}
            >
              <Text style={styles.chipText}>{semester}</Text>
            </Pressable>
          ))}
        </View>

        <AppButton title="Cadastrar Disciplina" onPress={handleSubmit} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipTitle: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#FDEEEE',
    borderWidth: 1,
    borderColor: '#F3C1C1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '600',
  },
});