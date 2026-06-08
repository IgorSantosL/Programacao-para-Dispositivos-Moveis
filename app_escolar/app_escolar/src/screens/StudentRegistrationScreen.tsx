import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import { createStudent, getStudentSubjects, listStudents, listSubjects, updateStudentSubjects } from '../services/academicService';
import { getAddressByCep, getCitiesByState, getStates } from '../services/addressService';
import { colors } from '../styles/colors';
import { ExternalState, Student } from '../types';

interface StudentErrors {
  name: string; registration: string; course: string; email: string; phone: string; cep: string; address: string; city: string; state: string; password: string; subjectIds: string;
}

const initialForm: Student = {
  name: '', registration: '', course: '', email: '', phone: '', cep: '', address: '', city: '', state: '', password: '', login: '', subjectIds: [],
};
const initialErrors: StudentErrors = { name: '', registration: '', course: '', email: '', phone: '', cep: '', address: '', city: '', state: '', password: '', subjectIds: '' };

function onlyNumbers(value: string) { return value.replace(/\D/g, ''); }
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }
function isTextFieldValid(value: string) { const trimmed = value.trim(); return trimmed.length >= 2 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed) && !/^[\d\s\W_]+$/u.test(trimmed); }
function normalizeCourse(value: string) { return value.trim().toLowerCase(); }
function courseMatches(a: string, b: string) { const left = normalizeCourse(a); const right = normalizeCourse(b); return left === right || left.includes(right) || right.includes(left); }

export default function StudentRegistrationScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState<Student>(initialForm);
  const [errors, setErrors] = useState<StudentErrors>(initialErrors);
  const [states, setStates] = useState<ExternalState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [editingCourse, setEditingCourse] = useState('');
  const [editingSubjectIds, setEditingSubjectIds] = useState<number[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadDependencies() {
    if (!token) return;
    try {
      const [statesResponse, studentsResponse, subjectsResponse] = await Promise.all([getStates(), listStudents(token), listSubjects(token)]);
      setStates(statesResponse); setStudents(studentsResponse); setSubjects(subjectsResponse);
    } catch (error) {
      Alert.alert('Falha ao carregar dados', error instanceof Error ? error.message : 'Não foi possível carregar as dependências.');
    }
  }

  useEffect(() => { loadDependencies(); }, [token]);
  useEffect(() => {
    async function fetchAddress() {
      const cleanCep = onlyNumbers(form.cep);
      if (cleanCep.length !== 8) return;
      setIsSearchingCep(true);
      const response = await getAddressByCep(cleanCep);
      if (response) {
        const nextState = response.state.toUpperCase();
        setForm((prev) => ({ ...prev, address: response.address, city: response.city, state: nextState }));
        try { setCities(await getCitiesByState(nextState)); } catch {}
      }
      setIsSearchingCep(false);
    }
    fetchAddress();
  }, [form.cep]);
  useEffect(() => {
    async function fetchCities() {
      if (!form.state) { setCities([]); return; }
      try { setCities(await getCitiesByState(form.state)); } catch {}
    }
    fetchCities();
  }, [form.state]);

  function updateField(field: keyof Student, value: string) {
    let sanitizedValue = value;
    if (field === 'registration' || field === 'phone' || field === 'cep') sanitizedValue = onlyNumbers(value);
    if (field === 'state') { sanitizedValue = value.toUpperCase(); setForm((prev) => ({ ...prev, city: '' })); }
    if (field === 'course') { setForm((prev) => ({ ...prev, subjectIds: [] })); }
    setForm((prev) => ({ ...prev, [field]: sanitizedValue }));
    if (field in errors && errors[field as keyof StudentErrors]) setErrors((prev) => ({ ...prev, [field]: '' } as StudentErrors));
  }

  function toggleSubject(subjectId: number) {
    setForm((prev) => {
      const exists = prev.subjectIds?.includes(subjectId);
      return {
        ...prev,
        subjectIds: exists ? prev.subjectIds?.filter((id) => id !== subjectId) : [...(prev.subjectIds || []), subjectId],
      };
    });
    if (errors.subjectIds) setErrors((prev) => ({ ...prev, subjectIds: '' }));
  }

  function toggleEditingSubject(subjectId: number) {
    setEditingSubjectIds((prev) => prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]);
  }

  function validateForm() {
    const nextErrors = { ...initialErrors }; let valid = true;
    if (!isTextFieldValid(form.name)) { nextErrors.name = 'Informe um nome válido.'; valid = false; }
    if (!/^\d+$/.test(form.registration)) { nextErrors.registration = 'Matrícula deve ser numérica.'; valid = false; }
    if (!isTextFieldValid(form.course)) { nextErrors.course = 'Informe um curso válido.'; valid = false; }
    if (!isValidEmail(form.email)) { nextErrors.email = 'Informe um e-mail válido.'; valid = false; }
    if (!/^\d{10,11}$/.test(form.phone)) { nextErrors.phone = 'Telefone deve ter 10 ou 11 dígitos.'; valid = false; }
    if (!/^\d{8}$/.test(form.cep)) { nextErrors.cep = 'CEP deve ter 8 dígitos.'; valid = false; }
    if (!isTextFieldValid(form.address)) { nextErrors.address = 'Informe um endereço válido.'; valid = false; }
    if (!isTextFieldValid(form.city)) { nextErrors.city = 'Selecione uma cidade válida.'; valid = false; }
    if (!/^[A-Z]{2}$/.test(form.state)) { nextErrors.state = 'Selecione uma UF válida.'; valid = false; }
    if (!form.password || form.password.length < 6) { nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.'; valid = false; }
    if (!form.subjectIds?.length) { nextErrors.subjectIds = 'Selecione pelo menos uma disciplina do curso do aluno.'; valid = false; }
    setErrors(nextErrors); return valid;
  }

  async function handleSubmit() {
    if (!token) return;
    if (!validateForm()) { Alert.alert('Cadastro inválido', 'Revise os campos do formulário.'); return; }
    try {
      setSubmitting(true);
      await createStudent({ ...form, login: form.login || form.email }, token);
      Alert.alert('Aluno cadastrado', 'Registro salvo com acesso do aluno criado com sucesso.');
      setForm(initialForm); setErrors(initialErrors); await loadDependencies();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Falha ao salvar aluno.');
    } finally { setSubmitting(false); }
  }

  async function startEditingStudent(student: any) {
    if (!token) return;
    try {
      const studentSubjects = await getStudentSubjects(student.id, token);
      setEditingStudentId(student.id);
      setEditingStudentName(student.nome);
      setEditingCourse(student.curso);
      setEditingSubjectIds(studentSubjects.map((item) => item.id));
    } catch (error) {
      Alert.alert('Erro ao carregar vínculos', error instanceof Error ? error.message : 'Falha ao abrir edição.');
    }
  }

  async function handleSaveStudentSubjects() {
    if (!token || !editingStudentId) return;
    if (!editingSubjectIds.length) {
      Alert.alert('Seleção obrigatória', 'O aluno precisa permanecer vinculado a pelo menos uma disciplina do curso.');
      return;
    }

    try {
      setSavingEdit(true);
      await updateStudentSubjects(editingStudentId, editingSubjectIds, token);
      Alert.alert('Disciplinas atualizadas', 'Os vínculos do aluno foram atualizados com sucesso.');
      setEditingStudentId(null);
      setEditingStudentName('');
      setEditingCourse('');
      setEditingSubjectIds([]);
      await loadDependencies();
    } catch (error) {
      Alert.alert('Erro ao salvar vínculos', error instanceof Error ? error.message : 'Falha ao atualizar disciplinas.');
    } finally {
      setSavingEdit(false);
    }
  }

  const stateOptions = useMemo(() => states.map((item) => ({ label: `${item.sigla} - ${item.nome}`, value: item.sigla })), [states]);
  const cityOptions = useMemo(() => cities.map((item) => ({ label: item, value: item })), [cities]);
  const availableSubjects = useMemo(() => subjects.filter((subject) => !form.course || courseMatches(subject.curso, form.course)), [subjects, form.course]);
  const editingAvailableSubjects = useMemo(() => subjects.filter((subject) => !editingCourse || courseMatches(subject.curso, editingCourse)), [subjects, editingCourse]);

  return (
    <ScreenContainer>
      <SectionTitle title="Cadastro de Alunos" subtitle="O administrador cria o cadastro, define a senha inicial e vincula o aluno a pelo menos uma disciplina do curso correspondente." />
      <View style={styles.card}>
        <AppInput label="Nome" placeholder="Digite o nome completo" value={form.name} onChangeText={(text) => updateField('name', text)} error={errors.name} />
        <AppInput label="Matrícula" placeholder="Digite a matrícula" value={form.registration} onChangeText={(text) => updateField('registration', text)} error={errors.registration} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="Curso" placeholder="Ex.: ADS" value={form.course} onChangeText={(text) => updateField('course', text)} error={errors.course} />
        <AppInput label="Email" placeholder="Digite o email" value={form.email} onChangeText={(text) => updateField('email', text)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
        <AppInput label="Login (opcional)" placeholder="Se vazio, será o e-mail" value={form.login || ''} onChangeText={(text) => updateField('login', text)} autoCapitalize="none" />
        <AppInput label="Senha inicial" placeholder="Mínimo 6 caracteres" value={form.password || ''} onChangeText={(text) => updateField('password', text)} error={errors.password} secureTextEntry autoCapitalize="none" />
        <AppInput label="Telefone" placeholder="Somente números com DDD" value={form.phone} onChangeText={(text) => updateField('phone', text)} error={errors.phone} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="CEP" placeholder="Digite o CEP" value={form.cep} onChangeText={(text) => updateField('cep', text)} error={errors.cep} keyboardType="number-pad" autoCapitalize="none" />
        {isSearchingCep ? <Text style={styles.helperText}>Consultando ViaCEP...</Text> : null}
        <AppInput label="Endereço" placeholder="Logradouro" value={form.address} onChangeText={(text) => updateField('address', text)} error={errors.address} />
        <SelectField label="Estado" placeholder="Selecione a UF" value={form.state} options={stateOptions} onSelect={(value) => updateField('state', value)} error={errors.state} />
        <SelectField label="Cidade" placeholder="Selecione a cidade" value={form.city} options={cityOptions} onSelect={(value) => updateField('city', value)} error={errors.city} />

        <Text style={styles.subjectTitle}>Disciplinas do aluno</Text>
        <Text style={styles.subjectSubtitle}>Somente disciplinas do curso informado podem ser vinculadas.</Text>
        {!!errors.subjectIds ? <Text style={styles.errorText}>{errors.subjectIds}</Text> : null}
        <View style={styles.chipContainer}>
          {availableSubjects.map((subject) => {
            const active = form.subjectIds?.includes(subject.id);
            return (
              <Pressable key={subject.id} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleSubject(subject.id)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{subject.nome}</Text>
              </Pressable>
            );
          })}
          {!availableSubjects.length ? <Text style={styles.helperText}>Cadastre disciplinas primeiro ou informe exatamente o curso do aluno.</Text> : null}
        </View>

        <AppButton title="Salvar aluno" onPress={handleSubmit} loading={submitting} />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Alunos cadastrados</Text>
        <FlatList data={students} keyExtractor={(item) => String(item.id)} scrollEnabled={false} renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <Text style={styles.rowTitle}>{item.nome}</Text>
            <Text style={styles.rowText}>Matrícula: {item.matricula}</Text>
            <Text style={styles.rowText}>{item.curso}</Text>
            <Text style={styles.rowText}>{item.email}</Text>
            <Text style={styles.rowText}>Disciplinas: {item.disciplinas || 'Nenhuma'}</Text>
            <Pressable style={styles.editButton} onPress={() => startEditingStudent(item)}>
              <Text style={styles.editButtonText}>Editar disciplinas</Text>
            </Pressable>
          </View>
        )} ListEmptyComponent={<Text style={styles.emptyText}>Nenhum aluno cadastrado ainda.</Text>} />
      </View>

      {editingStudentId ? (
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Editar disciplinas de {editingStudentName}</Text>
          <Text style={styles.subjectSubtitle}>Curso do aluno: {editingCourse}</Text>
          <View style={styles.chipContainer}>
            {editingAvailableSubjects.map((subject) => {
              const active = editingSubjectIds.includes(subject.id);
              return (
                <Pressable key={subject.id} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleEditingSubject(subject.id)}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{subject.nome}</Text>
                </Pressable>
              );
            })}
            {!editingAvailableSubjects.length ? <Text style={styles.helperText}>Não há disciplinas cadastradas para este curso.</Text> : null}
          </View>
          <AppButton title="Salvar disciplinas do aluno" onPress={handleSaveStudentSubjects} loading={savingEdit} />
          <View style={styles.cancelSpacing}>
            <AppButton title="Cancelar edição" onPress={() => { setEditingStudentId(null); setEditingStudentName(''); setEditingCourse(''); setEditingSubjectIds([]); }} variant="secondary" />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 18 },
  listCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 18 },
  editCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border },
  listTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 12 },
  editTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
  rowCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: colors.surfaceMuted },
  rowTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  rowText: { color: colors.textLight, marginBottom: 2 },
  emptyText: { color: colors.textMuted },
  helperText: { marginTop: -8, marginBottom: 14, color: colors.textLight, fontSize: 13 },
  subjectTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subjectSubtitle: { color: colors.textLight, marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: '#FFF2F2', borderWidth: 1, borderColor: '#F3C1C1' },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  chipTextActive: { color: '#FFFFFF' },
  errorText: { color: colors.danger, marginBottom: 10, fontSize: 13 },
  editButton: { marginTop: 10, backgroundColor: '#FCEAEA', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, alignSelf: 'flex-start' },
  editButtonText: { color: colors.primaryDark, fontWeight: '800' },
  cancelSpacing: { marginTop: 10 },
});
