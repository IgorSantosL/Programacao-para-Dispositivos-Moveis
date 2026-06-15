export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  StudentPortal: undefined;
  StudentRegistration: undefined;
  TeacherRegistration: undefined;
  SubjectRegistration: undefined;
  AcademicRecords: undefined;
  ReportCard: undefined;
  TeacherSubjects: undefined;
  TeacherSubjectStudents: {
    subjectId: number;
    subjectName: string;
    course: string;
    semester: string;
    teacherName?: string | null;
  };
  TeacherGradeEntry: {
    subjectId: number;
    subjectName: string;
    studentId: number;
    studentName: string;
    registration: string;
  };
};
