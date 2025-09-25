export type Teacher = {
  id: string;
  name: string;
  subject?: string;
};

export const sampleTeachers: Teacher[] = [
  { id: 't-1', name: 'Mr. Zhang', subject: 'Math' },
];
