export type Exam = {
  id: string;
  subject: string;
  score?: number;
};

export const sampleExams: Exam[] = [
  { id: 'e-1', subject: 'Math', score: undefined },
];
