import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import { createTeacher, listAvailableSubjects, listTeachers } from '../services/academicService';
import { colors } from '../styles/colors';
import { Teacher } from '../types';

interface TeacherErrors { name: string; title: string; area: string; teachingTime: string; email: string; password: string; disciplineId: string; }
const initialForm: Teacher = { name: '', title: '', area: '', teachingTime: '', email: '', password: '', login: '', disciplineId: undefined, disciplineName: '' };
const initialErrors: TeacherErrors = { name: '', title: '', area: '', teachingTime: '', email: '', password: '', disciplineId: '' };
function onlyNumbers(value: string) { return value.replace(/\D/g, ''); }
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }
function isTextFieldValid(value: string) { const trimmed = value.trim(); return trimmed.length >= 2 && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed) && !/^[\d\s\W_]+$/u.test(trimmed); }

export default function TeacherRegistrationScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState<Teacher>(initialForm);
  const [errors, setErrors] = useState<TeacherErrors>(initialErrors);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadDependencies() {
    if (!token) return;
    try {
      const [teachersResponse, availableSubjectsResponse] = await Promise.all([
        listTeachers(token),
        listAvailableSubjects(token),
      ]);
      setTeachers(teachersResponse);
      setAvailableSubjects(availableSubjectsResponse);
    } catch (error) {
      Alert.alert('Falha ao carregar professores', error instanceof Error ? error.message : 'Erro desconhecido.');
    }
  }

  useEffect(() => { loadDependencies(); }, [token]);

  function updateField(field: keyof Teacher, value: string) {
    let next = value;
    if (field === 'teachingTime') next = onlyNumbers(value);

    if (field === 'disciplineName') {
      const found = availableSubjects.find((item) => String(item.id) === value);
      setForm((prev) => ({
        ...prev,
        disciplineId: found?.id,
        disciplineName: found ? `${found.nome} • ${found.curso}` : '',
      }));
      if (errors.disciplineId) setErrors((prev) => ({ ...prev, disciplineId: '' }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: next }));
    if (field in errors && errors[field as keyof TeacherErrors]) setErrors((prev) => ({ ...prev, [field]: '' } as TeacherErrors));
  }

  function validateForm() {
    const nextErrors = { ...initialErrors }; let valid = true;
    if (!isTextFieldValid(form.name)) { nextErrors.name = 'Informe um nome válido.'; valid = false; }
    if (!isTextFieldValid(form.title)) { nextErrors.title = 'Informe uma titulação válida.'; valid = false; }
    if (!isTextFieldValid(form.area)) { nextErrors.area = 'Informe uma área de atuação válida.'; valid = false; }
    if (!/^\d+$/.test(form.teachingTime) || Number(form.teachingTime) <= 0) { nextErrors.teachingTime = 'Tempo de docência deve ser inteiro positivo.'; valid = false; }
    if (!isValidEmail(form.email)) { nextErrors.email = 'Informe um e-mail válido.'; valid = false; }
    if (!form.password || form.password.length < 6) { nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.'; valid = false; }
    if (!form.disciplineId) { nextErrors.disciplineId = 'Selecione uma disciplina sem professor.'; valid = false; }
    setErrors(nextErrors); return valid;
  }

  async function handleSubmit() {
    if (!token) return;
    if (!validateForm()) { Alert.alert('Cadastro inválido', 'Revise os campos destacados.'); return; }
    try {
      setSubmitting(true);
      await createTeacher({ ...form, login: form.login || form.email }, token);
      Alert.alert('Professor cadastrado', 'Professor criado e vinculado à disciplina selecionada.');
      setForm(initialForm);
      setErrors(initialErrors);
      await loadDependencies();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', error instanceof Error ? error.message : 'Erro desconhecido.');
    } finally {
      setSubmitting(false);
    }
  }

  const subjectOptions = useMemo(
    () => availableSubjects.map((item) => ({ label: `${item.nome} • ${item.curso} • ${item.semestre}`, value: String(item.id) })),
    [availableSubjects]
  );

  return (
    <ScreenContainer>
      <SectionTitle title="Cadastro de Professores" subtitle="O professor é criado já vinculado a uma disciplina existente que ainda não possui docente responsável." />
      <View style={styles.card}>
        <SelectField
          label="Disciplina para vincular"
          placeholder="Selecione uma disciplina sem professor"
          value={form.disciplineName || ''}
          options={subjectOptions}
          onSelect={(value) => updateField('disciplineName', value)}
          error={errors.disciplineId}
        />
        <AppInput label="Nome" placeholder="Nome completo" value={form.name} onChangeText={(text) => updateField('name', text)} error={errors.name} />
        <AppInput label="Titulação" placeholder="Ex.: Mestre" value={form.title} onChangeText={(text) => updateField('title', text)} error={errors.title} />
        <AppInput label="Área de atuação" placeholder="Ex.: Programação Mobile" value={form.area} onChangeText={(text) => updateField('area', text)} error={errors.area} />
        <AppInput label="Tempo de docência (anos)" placeholder="Ex.: 8" value={form.teachingTime} onChangeText={(text) => updateField('teachingTime', text)} error={errors.teachingTime} keyboardType="number-pad" autoCapitalize="none" />
        <AppInput label="Email" placeholder="Digite o email" value={form.email} onChangeText={(text) => updateField('email', text)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
        <AppInput label="Login (opcional)" placeholder="Se vazio, será o e-mail" value={form.login || ''} onChangeText={(text) => updateField('login', text)} autoCapitalize="none" />
        <AppInput label="Senha inicial" placeholder="Mínimo 6 caracteres" value={form.password || ''} onChangeText={(text) => updateField('password', text)} error={errors.password} secureTextEntry autoCapitalize="none" />
        <AppButton title="Salvar professor" onPress={handleSubmit} loading={submitting} />
      </View>
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>Corpo docente</Text>
        <FlatList data={teachers} keyExtractor={(item) => String(item.id)} scrollEnabled={false} renderItem={({ item }) => (
          <View style={styles.rowCard}><Text style={styles.rowTitle}>{item.nome}</Text><Text style={styles.rowText}>{item.titulacao} • {item.area}</Text><Text style={styles.rowText}>Docência: {item.tempo_docencia} anos</Text><Text style={styles.rowText}>{item.email}</Text><Text style={styles.rowText}>Disciplina(s): {item.disciplinas || 'Nenhuma'}</Text></View>
        )} ListEmptyComponent={<Text style={styles.emptyText}>Nenhum professor cadastrado ainda.</Text>} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 18 },
  listCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.border },
  listTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 12 },
  rowCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: colors.surfaceMuted },
  rowTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  rowText: { color: colors.textLight, marginBottom: 2 },
  emptyText: { color: colors.textMuted },
});
