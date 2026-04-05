export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Student {
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

export interface Teacher {
  name: string;
  title: string;
  area: string;
  teachingTime: string;
  email: string;
}

export interface Subject {
  name: string;
  workload: string;
  teacher: string;
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
}