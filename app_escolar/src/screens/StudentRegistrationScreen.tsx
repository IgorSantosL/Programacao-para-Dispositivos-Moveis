import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import { createStudent, listStudents } from '../services/academicService';
import { getAddressByCep, getCitiesByState, getStates } from '../services/addressService';
import { colors } from '../styles/colors';
import { ExternalState, Student } from '../types';

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
  return trimmed.length >= 2 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed) && !/^[\d\s\W_]+$/u.test(trimmed);
}

export default function StudentRegistrationScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState<Student>(initialForm);
  const [errors, setErrors] = useState<StudentErrors>(initialErrors);
  const [states, setStates] = useState<ExternalState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  async function loadDependencies() {
    if (!token) return;

    try {
      const [statesResponse, studentsResponse] = await Promise.all([
        getStates(),
        listStudents(token),
      ]);
      setStates(statesResponse);
      setStudents(studentsResponse);
    } catch (error) {
      Alert.alert(
        'Falha ao carregar dados',
        error instanceof Error ? error.message : 'Não foi possível carregar as dependências.'
      );
    }
  }

  useEffect(() => {
    loadDependencies();
  }, [token]);

  useEffect(() => {
    async function fetchAddress() {
      const cleanCep = onlyNumbers(form.cep);
      if (cleanCep.length !== 8) return;

      setIsSearchingCep(true);
      const response = await getAddressByCep(cleanCep);
      if (response) {
        const nextState = response.state.toUpperCase();
        setForm((prev) => ({
          ...prev,
          address: response.address,
          city: response.city,
          state: nextState,
        }));

        try {
          const nextCities = await getCitiesByState(nextState);
          setCities(nextCities);
        } catch {}
      }
      setIsSearchingCep(false);
    }

    fetchAddress();
  }, [form.cep]);

  useEffect(() => {
    async function fetchCities() {
      if (!form.state) {
        setCities([]);
        return;
      }

      try {
        const response = await getCitiesByState(form.state);
        setCities(response);
      } catch {}
    }

    fetchCities();
  }, [form.state]);

  function updateField(field: keyof Student, value: string) {
    let sanitizedValue = value;

    if (field === 'registration' || field === 'phone' || field === 'cep') {
      sanitizedValue = onlyNumbers(value);
    }

    if (field === 'state') {
      sanitizedValue = value.toUpperCase();
      setForm((prev) => ({ ...prev, city: '' }));
    }

    setForm((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));

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

    if (!/^\d+$/.test(form.registration)) {
      nextErrors.registration = 'Matrícula deve ser numérica.';
      valid = false;
    }

    if (!isTextFieldValid(form.course)) {
      nextErrors.course = 'Informe um curso válido.';
      valid = false;
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Informe um e-mail válido.';
      valid = false;
    }

    if (!/^\d{10,11}$/.test(form.phone)) {
      nextErrors.phone = 'Telefone deve ter 10 ou 11 dígitos.';
      valid = false;
    }

    if (!/^\d{8}$/.test(form.cep)) {
      nextErrors.cep = 'CEP deve ter 8 dígitos.';
      valid = false;
    }

    if (!isTextFieldValid(form.address)) {
      nextErrors.address = 'Informe um endereço válido.';
      valid = false;
    }

    if (!isTextFieldValid(form.city)) {
      nextErrors.city = 'Selecione uma cidade válida.';
      valid = false;
    }

    if (!/^[A-Z]{2}$/.test(form.state)) {
      nextErrors.state = 'Selecione uma UF válida.';
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  }

  async function handleSubmit() {
    if (!token) return;

    if (!validateForm()) {
      Alert.alert('Cadastro inválido', 'Revise os campos do formulário.');
      return;
    }

    try {
      setSubmitting(true);
      await createStudent(form, token);
      Alert.alert('Aluno cadastrado', 'Registro salvo com sucesso no PostgreSQL.');
      setForm(initialForm);
      setErrors(initialErrors);
      await loadDependencies();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Falha ao salvar aluno.');
    } finally {
      setSubmitting(false);
    }
  }

  const stateOptions = useMemo(
    () => states.map((item) => ({ label: `${item.sigla} - ${item.nome}`, value: item.sigla })),
    [states]
  );

  const cityOptions = useMemo(
    () => cities.map((item) => ({ label: item, value: item })),
    [cities]
  );

  return (
    <ScreenContainer>
      <SectionTitle
        title="Cadastro de Alunos"
        subtitle="Conectado ao backend. Endereço automático via ViaCEP e estados/cidades via IBGE."
      />

      <View style={styles.card}>
        <AppInput label="Nome" placeholder="Digite o nome completo" value={form.name} onChangeText={(text) => updateField('name', text)} error={errors.name} />
        <AppInput label="Matrícula" placeholder="Digite a matrícula" value={form.registration} onChangeText={(text) => updateField('registration', text)} error={errors.registration} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="Curso" placeholder="Ex.: ADS" value={form.course} onChangeText={(text) => updateField('course', text)} error={errors.course} />
        <AppInput label="Email" placeholder="Digite o email" value={form.email} onChangeText={(text) => updateField('email', text)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
        <AppInput label="Telefone" placeholder="Somente números com DDD" value={form.phone} onChangeText={(text) => updateField('phone', text)} error={errors.phone} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="CEP" placeholder="Digite o CEP" value={form.cep} onChangeText={(text) => updateField('cep', text)} error={errors.cep} keyboardType="number-pad" autoCapitalize="none" />
        {isSearchingCep ? <Text style={styles.helperText}>Consultando ViaCEP...</Text> : null}

        <AppInput label="Endereço" placeholder="Rua, número e complemento" value={form.address} onChangeText={(text) => updateField('address', text)} error={errors.address} />

        <SelectField
          label="Estado"
          placeholder="Selecione a UF"
          value={form.state}
          options={stateOptions}
          onSelect={(value) => updateField('state', value)}
          error={errors.state}
        />

        <SelectField
          label="Cidade"
          placeholder={form.state ? 'Selecione a cidade' : 'Escolha um estado primeiro'}
          value={form.city}
          options={cityOptions}
          onSelect={(value) => updateField('city', value)}
          error={errors.city}
        />

        <AppButton title="Salvar aluno" onPress={handleSubmit} loading={submitting} />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Alunos cadastrados</Text>
        <FlatList
          data={students}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.rowCard}>
              <Text style={styles.rowTitle}>{item.nome}</Text>
              <Text style={styles.rowText}>Matrícula: {item.matricula}</Text>
              <Text style={styles.rowText}>Curso: {item.curso}</Text>
              <Text style={styles.rowText}>Cidade/UF: {item.cidade} - {item.estado}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno cadastrado ainda.</Text>}
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
  helperText: {
    marginTop: -8,
    marginBottom: 14,
    color: colors.textLight,
    fontSize: 13,
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
