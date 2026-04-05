import { ReportCardItem, Teacher } from '../types';

export const mockTeachers: Teacher[] = [
  {
    name: 'André Olímpio',
    title: 'Mestre',
    area: 'Desenvolvimento Mobile',
    teachingTime: '8 anos',
    email: 'andre.olimpio@faculdade.edu',
  },
  {
    name: 'Carla Mendes',
    title: 'Doutora',
    area: 'Banco de Dados',
    teachingTime: '12 anos',
    email: 'carla.mendes@faculdade.edu',
  },
  {
    name: 'João Ferreira',
    title: 'Especialista',
    area: 'Engenharia de Software',
    teachingTime: '6 anos',
    email: 'joao.ferreira@faculdade.edu',
  },
];

export const mockCourses = [
  'Análise e Desenvolvimento de Sistemas',
  'Banco de Dados',
  'Segurança da Informação',
  'Ciência de Dados',
];

export const mockSemesters = [
  '1º Semestre',
  '2º Semestre',
  '3º Semestre',
  '4º Semestre',
  '5º Semestre',
  '6º Semestre',
];

export const mockReportCard: ReportCardItem[] = [
  {
    id: 1,
    discipline: 'Programação para Dispositivos Móveis I',
    grade1: 8.5,
    grade2: 9.0,
    average: 8.75,
    status: 'Aprovado',
  },
  {
    id: 2,
    discipline: 'Banco de Dados',
    grade1: 7.0,
    grade2: 6.0,
    average: 6.5,
    status: 'Recuperação',
  },
  {
    id: 3,
    discipline: 'Engenharia de Software',
    grade1: 5.0,
    grade2: 4.5,
    average: 4.75,
    status: 'Reprovado',
  },
  {
    id: 4,
    discipline: 'UX/UI para Aplicações',
    grade1: 9.5,
    grade2: 8.5,
    average: 9.0,
    status: 'Aprovado',
  },
];