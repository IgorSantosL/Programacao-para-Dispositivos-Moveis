import {
  AcademicRecordRow,
  ApiMessageResponse,
  DashboardSummary,
  GradeEntryDetail,
  GradeEntrySaveResponse,
  ProfessorDisciplineStudent,
  ProfessorSubjectSummary,
  ReportCardResponse,
  Student,
  Subject,
  Teacher,
} from '../types';
import { apiRequest } from './api';

export function createStudent(payload: Student, token: string) {
  return apiRequest<ApiMessageResponse>('/alunos', {
    method: 'POST',
    token,
    body: {
      nome: payload.name,
      matricula: Number(payload.registration),
      curso: payload.course,
      email: payload.email,
      telefone: payload.phone,
      cep: payload.cep,
      endereco: payload.address,
      cidade: payload.city,
      estado: payload.state,
      senha: payload.password,
      login: payload.login || payload.email,
      disciplina_ids: payload.subjectIds || [],
    },
  });
}

export function listStudents(token: string) {
  return apiRequest<any[]>('/alunos', { token });
}

export function getStudentSubjects(studentId: number, token: string) {
  return apiRequest<any[]>(`/alunos/${studentId}/disciplinas`, { token });
}

export function updateStudentSubjects(studentId: number, disciplineIds: number[], token: string) {
  return apiRequest<ApiMessageResponse>(`/alunos/${studentId}/disciplinas`, {
    method: 'PUT',
    token,
    body: { disciplina_ids: disciplineIds },
  });
}

export function createTeacher(payload: Teacher, token: string) {
  return apiRequest<ApiMessageResponse>('/professores', {
    method: 'POST',
    token,
    body: {
      nome: payload.name,
      titulacao: payload.title,
      area: payload.area,
      tempo_docencia: Number(payload.teachingTime),
      email: payload.email,
      senha: payload.password,
      login: payload.login || payload.email,
      disciplina_id: payload.disciplineId,
    },
  });
}

export function listTeachers(token: string) {
  return apiRequest<any[]>('/professores', { token });
}

export function createSubject(payload: Subject, token: string) {
  return apiRequest<ApiMessageResponse>('/disciplinas', {
    method: 'POST',
    token,
    body: {
      nome: payload.name,
      carga_horaria: Number(payload.workload),
      professor_id: payload.teacherId,
      curso: payload.course,
      semestre: payload.semester,
    },
  });
}

export function listSubjects(token: string) {
  return apiRequest<any[]>('/disciplinas', { token });
}

export function listAvailableSubjects(token: string, course?: string) {
  const query = course ? `?curso=${encodeURIComponent(course)}` : '';
  return apiRequest<any[]>(`/disciplinas-disponiveis${query}`, { token });
}

export async function saveAcademicRecord(payload: { aluno_id: number; disciplina_id: number; nota1: number; nota2: number; faltas: number; total_aulas: number }, token: string) {
  await apiRequest<ApiMessageResponse>('/notas', {
    method: 'POST', token,
    body: { aluno_id: payload.aluno_id, disciplina_id: payload.disciplina_id, nota1: payload.nota1, nota2: payload.nota2 },
  });
  return apiRequest<ApiMessageResponse>('/frequencias', {
    method: 'POST', token,
    body: { aluno_id: payload.aluno_id, disciplina_id: payload.disciplina_id, faltas: payload.faltas, total_aulas: payload.total_aulas },
  });
}

export function listAcademicRecords(token: string) {
  return apiRequest<AcademicRecordRow[]>('/academic-records', { token });
}

export function getReportCardByRegistration(matricula: string, token: string) {
  return apiRequest<ReportCardResponse>(`/boletim/${matricula}`, { token });
}

export function getDashboardSummary(token: string) {
  return apiRequest<DashboardSummary>('/dashboard/summary', { token });
}

export function listTeacherSubjectsForGrades(token: string) {
  return apiRequest<ProfessorSubjectSummary[]>('/professor/disciplinas', { token });
}

export function listStudentsByTeacherSubject(subjectId: number, token: string) {
  return apiRequest<ProfessorDisciplineStudent[]>(`/professor/disciplinas/${subjectId}/alunos`, { token });
}

export function getGradeEntryDetail(subjectId: number, studentId: number, token: string) {
  return apiRequest<GradeEntryDetail>(`/professor/disciplinas/${subjectId}/alunos/${studentId}/notas`, { token });
}

export function saveTeacherGrade(subjectId: number, studentId: number, payload: { nota1: number; nota2: number }, token: string) {
  return apiRequest<GradeEntrySaveResponse>(`/professor/disciplinas/${subjectId}/alunos/${studentId}/notas`, {
    method: 'PUT',
    token,
    body: payload,
  });
}
