export type UserProfile = 'admin' | 'professor' | 'aluno';

export interface User {
  id: number;
  name: string;
  email: string;
  profile: UserProfile;
  professorId?: number | null;
  studentId?: number | null;
  registration?: string | null;
  course?: string | null;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: UserProfile;
    professor_id?: number | null;
    aluno_id?: number | null;
    matricula?: string | null;
    curso?: string | null;
  };
}

export interface Student {
  id?: number;
  name: string;
  registration: string;
  course: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  password?: string;
  login?: string;
  subjectIds?: number[];
}

export interface Teacher {
  id?: number;
  name: string;
  title: string;
  area: string;
  teachingTime: string;
  email: string;
  password?: string;
  login?: string;
  disciplineId?: number;
  disciplineName?: string;
}

export interface Subject {
  id?: number;
  name: string;
  workload: string;
  teacher: string;
  teacherId?: number;
  course: string;
  semester: string;
}

export interface ReportCardItem {
  id: number;
  discipline: string;
  grade1: number;
  grade2: number;
  average: number;
  status: 'Aprovado' | 'Reprovado' | 'Recuperação';
  absences?: number;
  totalClasses?: number;
}

export interface DashboardSummary {
  students: number;
  teachers: number;
  subjects: number;
  records: number;
}

export interface ExternalState {
  id: number;
  nome: string;
  sigla: string;
}

export interface AcademicRecordForm {
  studentId: string;
  subjectId: string;
  grade1: string;
  grade2: string;
  absences: string;
  totalClasses: string;
}

export interface AcademicRecordRow {
  aluno_id: number;
  aluno_nome: string;
  matricula: string;
  disciplina_id: number;
  disciplina_nome: string;
  professor_nome: string;
  nota1: number;
  nota2: number;
  media: number;
  situacao: string;
  faltas: number;
  total_aulas: number;
}

export interface ReportCardResponse {
  aluno: string;
  matricula: string;
  curso: string;
  disciplinas: Array<{
    disciplina: string;
    nota1: number;
    nota2: number;
    media: number;
    situacao: 'Aprovado' | 'Reprovado' | 'Recuperação';
    faltas: number;
    totalAulas: number;
    percentualFrequencia: number;
  }>;
}

export interface ApiMessageResponse {
  message: string;
}
