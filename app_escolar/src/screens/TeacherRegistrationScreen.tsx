import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { Teacher } from '../types';
import { colors } from '../styles/colors';

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

  if (trimmed.length < 2) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed)) return false;
  if (/^[\d\s\W_]+$/u.test(trimmed)) return false;

  return true;
}

export default function TeacherRegistrationScreen() {
  const [form, setForm] = useState<Teacher>(initialForm);
  const [errors, setErrors] = useState<TeacherErrors>(initialErrors);

  function updateField(field: keyof Teacher, value: string) {
    let sanitizedValue = value;

    if (field === 'teachingTime') {
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
      newErrors.name = 'Informe um nome válido.';
      valid = false;
    }

    if (!isTextFieldValid(form.title)) {
      newErrors.title = 'Informe uma titulação válida.';
      valid = false;
    }

    if (!isTextFieldValid(form.area)) {
      newErrors.area = 'Informe uma área de atuação válida.';
      valid = false;
    }

    if (!/^\d+$/.test(form.teachingTime.trim()) || Number(form.teachingTime) <= 0) {
      newErrors.teachingTime = 'Informe um tempo de docência em anos, usando número inteiro.';
      valid = false;
    }

    if (!isValidEmail(form.email)) {
      newErrors.email = 'Informe um email válido.';
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

    const teacherToSave = {
      name: form.name.trim(),
      title: form.title.trim(),
      area: form.area.trim(),
      teachingTime: Number(form.teachingTime),
      email: form.email.trim().toLowerCase(),
    };

    console.log('Professor cadastrado:', teacherToSave);

    Alert.alert(
      'Sucesso',
      'Professor cadastrado com validação segura. Nesta etapa, os dados continuam simulados.'
    );

    setForm(initialForm);
    setErrors(initialErrors);
  }

  return (
    <ScreenContainer>
      <SectionTitle
        title="Cadastro de Professores"
        subtitle="Preencha os dados do professor. O tempo de docência aceita apenas número inteiro."
      />

      <View style={styles.card}>
        <AppInput
          label="Nome"
          placeholder="Digite o nome do professor"
          value={form.name}
          onChangeText={(text) => updateField('name', text)}
          error={errors.name}
        />

        <AppInput
          label="Titulação"
          placeholder="Ex.: Mestre, Doutor, Especialista"
          value={form.title}
          onChangeText={(text) => updateField('title', text)}
          error={errors.title}
        />

        <AppInput
          label="Área de atuação"
          placeholder="Digite a área de atuação"
          value={form.area}
          onChangeText={(text) => updateField('area', text)}
          error={errors.area}
        />

        <AppInput
          label="Tempo de docência (anos)"
          placeholder="Ex.: 5"
          value={form.teachingTime}
          onChangeText={(text) => updateField('teachingTime', text)}
          error={errors.teachingTime}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <AppInput
          label="Email"
          placeholder="Digite o email"
          value={form.email}
          onChangeText={(text) => updateField('email', text)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppButton title="Cadastrar Professor" onPress={handleSubmit} />
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
});