import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { getAddressByCep } from '../services/addressService';
import { Student } from '../types';
import { colors } from '../styles/colors';

interface StudentErrors {
  name: string;
  registration: string;
  course: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
}

const initialForm: Student = {
  name: '',
  registration: '',
  course: '',
  email: '',
  phone: '',
  cep: '',
  address: '',
  city: '',
  state: '',
};

const initialErrors: StudentErrors = {
  name: '',
  registration: '',
  course: '',
  email: '',
  phone: '',
  cep: '',
  address: '',
  city: '',
  state: '',
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

  // Exige pelo menos uma letra
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed)) return false;

  // Não permite que seja apenas número/símbolo
  if (/^[\d\s\W_]+$/u.test(trimmed)) return false;

  return true;
}

function isValidState(value: string) {
  const trimmed = value.trim();

  // Aceita UF com 2 letras: SP, RJ, MG...
  if (/^[A-Za-zÀ-ÖØ-öø-ÿ]{2}$/u.test(trimmed)) return true;

  // Ou nome de estado escrito
  if (trimmed.length >= 2 && /[A-Za-zÀ-ÖØ-öø-ÿ]/u.test(trimmed)) return true;

  return false;
}

export default function StudentRegistrationScreen() {
  const [form, setForm] = useState<Student>(initialForm);
  const [errors, setErrors] = useState<StudentErrors>(initialErrors);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  useEffect(() => {
    async function fetchAddress() {
      const cleanCep = onlyNumbers(form.cep);

      if (cleanCep.length !== 8) return;

      setIsSearchingCep(true);
      const response = await getAddressByCep(cleanCep);

      if (response) {
        setForm((prev) => ({
          ...prev,
          address: response.address,
          city: response.city,
          state: response.state,
        }));
      }

      setIsSearchingCep(false);
    }

    fetchAddress();
  }, [form.cep]);

  function updateField(field: keyof Student, value: string) {
    let sanitizedValue = value;

    // Campos que devem conter apenas números
    if (field === 'registration' || field === 'phone' || field === 'cep') {
      sanitizedValue = onlyNumbers(value);
    }

    // Estado sempre em maiúsculo se digitar UF
    if (field === 'state') {
      sanitizedValue = value.toUpperCase();
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
    const newErrors: StudentErrors = { ...initialErrors };
    let valid = true;

    if (!isTextFieldValid(form.name)) {
      newErrors.name = 'Informe um nome válido.';
      valid = false;
    }

    if (!/^\d+$/.test(form.registration.trim())) {
      newErrors.registration = 'A matrícula deve conter apenas números inteiros.';
      valid = false;
    }

    if (!isTextFieldValid(form.course)) {
      newErrors.course = 'Informe um curso válido.';
      valid = false;
    }

    if (!isValidEmail(form.email)) {
      newErrors.email = 'Informe um email válido.';
      valid = false;
    }

    if (!/^\d{10,11}$/.test(form.phone.trim())) {
      newErrors.phone = 'Informe um telefone com 10 ou 11 dígitos.';
      valid = false;
    }

    if (!/^\d{8}$/.test(form.cep.trim())) {
      newErrors.cep = 'O CEP deve conter exatamente 8 números.';
      valid = false;
    }

    if (!isTextFieldValid(form.address)) {
      newErrors.address = 'Informe um endereço válido.';
      valid = false;
    }

    if (!isTextFieldValid(form.city)) {
      newErrors.city = 'Informe uma cidade válida.';
      valid = false;
    }

    if (!isValidState(form.state)) {
      newErrors.state = 'Informe um estado válido, como SP.';
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

    const studentToSave = {
      name: form.name.trim(),
      registration: Number(form.registration),
      course: form.course.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      cep: form.cep.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
    };

    console.log('Aluno cadastrado:', studentToSave);

    Alert.alert(
      'Sucesso',
      'Aluno cadastrado com validação segura. Nesta etapa, os dados continuam simulados.'
    );

    setForm(initialForm);
    setErrors(initialErrors);
  }

  return (
    <ScreenContainer>
      <SectionTitle
        title="Cadastro de Alunos"
        subtitle="Preencha os dados do aluno com informações válidas. Os campos numéricos aceitam apenas números."
      />

      <View style={styles.card}>
        <AppInput
          label="Nome"
          placeholder="Digite o nome do aluno"
          value={form.name}
          onChangeText={(text) => updateField('name', text)}
          error={errors.name}
        />

        <AppInput
          label="Matrícula"
          placeholder="Digite a matrícula"
          value={form.registration}
          onChangeText={(text) => updateField('registration', text)}
          error={errors.registration}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <AppInput
          label="Curso"
          placeholder="Digite o curso"
          value={form.course}
          onChangeText={(text) => updateField('course', text)}
          error={errors.course}
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

        <AppInput
          label="Telefone"
          placeholder="Digite o telefone com DDD"
          value={form.phone}
          onChangeText={(text) => updateField('phone', text)}
          error={errors.phone}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        <AppInput
          label="CEP"
          placeholder="Digite o CEP"
          value={form.cep}
          onChangeText={(text) => updateField('cep', text)}
          error={errors.cep}
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        {isSearchingCep ? (
          <Text style={styles.helperText}>Buscando endereço simulado...</Text>
        ) : (
          <Text style={styles.helperText}>
            CEPs mockados para teste: 12246000, 12300000, 01001000
          </Text>
        )}

        <AppInput
          label="Endereço"
          placeholder="Digite o endereço"
          value={form.address}
          onChangeText={(text) => updateField('address', text)}
          error={errors.address}
        />

        <AppInput
          label="Cidade"
          placeholder="Digite a cidade"
          value={form.city}
          onChangeText={(text) => updateField('city', text)}
          error={errors.city}
        />

        <AppInput
          label="Estado"
          placeholder="Ex.: SP"
          value={form.state}
          onChangeText={(text) => updateField('state', text)}
          error={errors.state}
          autoCapitalize="characters"
        />

        <AppButton title="Cadastrar Aluno" onPress={handleSubmit} />
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
  helperText: {
    marginTop: -8,
    marginBottom: 14,
    color: colors.textLight,
    fontSize: 13,
  },
});