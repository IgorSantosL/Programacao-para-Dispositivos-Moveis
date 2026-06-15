import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import BoletimCard from '../components/BoletimCard';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation/types';
import { getGradeEntryDetail, saveTeacherGrade } from '../services/academicService';
import { colors } from '../styles/colors';
import { GradeEntryDetail, GradeEntrySaveResponse, ReportCardItem } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherGradeEntry'>;

function normalizeNumberInput(value: string) {
  return value.replace(',', '.').replace(/[^\d.]/g, '');
}

function toNumber(value: string) {
  return Number(value.replace(',', '.'));
}

export default function TeacherGradeEntryScreen({ route }: Props) {
  const { token } = useAuth();
  const { subjectId, subjectName, studentId, studentName, registration } = route.params;
  const [detail, setDetail] = useState<GradeEntryDetail | null>(null);
  const [grade1, setGrade1] = useState('');
  const [grade2, setGrade2] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatedReport, setUpdatedReport] = useState<GradeEntrySaveResponse['boletimAtualizado'] | null>(null);

  const loadDetail = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getGradeEntryDetail(subjectId, studentId, token);
      setDetail(response);
      setGrade1(response.notas.nota1 !== null ? String(response.notas.nota1) : '');
      setGrade2(response.notas.nota2 !== null ? String(response.notas.nota2) : '');
    } catch (error) {
      Alert.alert('Erro ao carregar formulário', error instanceof Error ? error.message : 'Falha inesperada.');
    } finally {
      setLoading(false);
    }
  }, [subjectId, studentId, token]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  const previewAverage = useMemo(() => {
    const n1 = toNumber(grade1 || '0');
    const n2 = toNumber(grade2 || '0');

    if (Number.isNaN(n1) || Number.isNaN(n2)) return null;
    return Number(((n1 + n2) / 2).toFixed(2));
  }, [grade1, grade2]);

  const previewStatus = useMemo(() => {
    if (previewAverage === null) return '';
    if (previewAverage >= 7) return 'Aprovado';
    if (previewAverage >= 5) return 'Recuperação';
    return 'Reprovado';
  }, [previewAverage]);

  async function handleSave() {
    if (!token) return;

    const n1 = toNumber(grade1);
    const n2 = toNumber(grade2);

    if (Number.isNaN(n1) || n1 < 0 || n1 > 10 || Number.isNaN(n2) || n2 < 0 || n2 > 10) {
      Alert.alert('Notas inválidas', 'Informe valores entre 0 e 10 para nota 1 e nota 2.');
      return;
    }

    try {
      setSaving(true);
      const response = await saveTeacherGrade(subjectId, studentId, { nota1: n1, nota2: n2 }, token);
      setUpdatedReport(response.boletimAtualizado);
      Alert.alert('Notas salvas', 'As notas foram persistidas no PostgreSQL e o boletim já foi atualizado.');
      await loadDetail();
    } catch (error) {
      Alert.alert('Erro ao salvar notas', error instanceof Error ? error.message : 'Falha inesperada.');
    } finally {
      setSaving(false);
    }
  }

  const updatedSubjectCard = useMemo<ReportCardItem | null>(() => {
    if (!updatedReport) return null;
    const found = updatedReport.disciplinas.find((item) => item.disciplina === subjectName);
    if (!found) return null;
    return {
      id: 1,
      discipline: found.disciplina,
      grade1: found.nota1,
      grade2: found.nota2,
      average: found.media,
      status: found.situacao,
      absences: found.faltas,
      totalClasses: found.totalAulas,
    };
  }, [subjectName, updatedReport]);

  return (
    <ScreenContainer>
      <SectionTitle
        title="Lançamento de notas"
        subtitle={`Disciplina: ${subjectName} • Aluno: ${studentName} • Matrícula: ${registration}`}
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Contexto do lançamento</Text>
        <Text style={styles.infoText}>Professor da disciplina: {detail?.disciplina.professor_nome || 'Carregando...'}</Text>
        <Text style={styles.infoText}>Curso do aluno: {detail?.aluno.curso || 'Carregando...'}</Text>
        <Text style={styles.infoText}>Faltas registradas: {detail?.frequencia.faltas ?? 0} / {detail?.frequencia.totalAulas ?? 0}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{loading ? 'Carregando dados...' : 'Formulário de notas'}</Text>

        <AppInput
          label="Nota 1"
          placeholder="Informe a primeira nota"
          value={grade1}
          onChangeText={(text) => setGrade1(normalizeNumberInput(text))}
          keyboardType="decimal-pad"
          autoCapitalize="none"
        />

        <AppInput
          label="Nota 2"
          placeholder="Informe a segunda nota"
          value={grade2}
          onChangeText={(text) => setGrade2(normalizeNumberInput(text))}
          keyboardType="decimal-pad"
          autoCapitalize="none"
        />

        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Prévia instantânea</Text>
          <Text style={styles.previewText}>Média prevista: {previewAverage !== null ? previewAverage.toFixed(2) : '-'}</Text>
          <Text style={styles.previewText}>Situação prevista: {previewStatus || '-'}</Text>
        </View>

        <AppButton title="Registrar ou atualizar notas" onPress={handleSave} loading={saving} />
      </View>

      {updatedSubjectCard ? (
        <View style={styles.updatedCard}>
          <Text style={styles.updatedTitle}>Boletim atualizado automaticamente</Text>
          <Text style={styles.updatedText}>A disciplina abaixo já reflete os valores persistidos no banco após o salvamento.</Text>
          <BoletimCard item={updatedSubjectCard} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F3C1C1',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  infoTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 8,
  },
  infoText: {
    color: colors.text,
    lineHeight: 21,
    marginBottom: 3,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  formTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  previewTitle: {
    color: colors.primaryDark,
    fontWeight: '800',
    marginBottom: 6,
  },
  previewText: {
    color: colors.textLight,
    lineHeight: 20,
  },
  updatedCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
  },
  updatedTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 8,
  },
  updatedText: {
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
});
