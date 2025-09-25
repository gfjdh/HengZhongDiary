import type { GameTask } from '../../types/game';

export const dailyTaskTemplates: GameTask[] = [
  {
    id: 'daily-chinese-workbook',
    name: '语文学案',
    type: 'daily',
    subject: 'chinese',
    workload: 100,
    progress: 0,
    priority: 'required',
  },
  {
    id: 'daily-math-homework',
    name: '数学作业',
    type: 'daily',
    subject: 'math',
    workload: 100,
    progress: 0,
    priority: 'required',
  },
  {
    id: 'daily-self-study',
    name: '公共自习作业',
    type: 'daily',
    subject: 'english',
    workload: 80,
    progress: 0,
    priority: 'optional',
  },
];

export const timedTaskTemplates: GameTask[] = [
  {
    id: 'timed-accumulation-book',
    name: '积累本整理',
    type: 'timed',
    subject: 'chinese',
    workload: 120,
    progress: 0,
    deadline: 3,
    priority: 'required',
  },
  {
    id: 'timed-calligraphy',
    name: '习字练习',
    type: 'timed',
    subject: 'chinese',
    workload: 90,
    progress: 0,
    deadline: 5,
    priority: 'optional',
  },
];

export function cloneTask(task: GameTask): GameTask {
  return JSON.parse(JSON.stringify(task));
}

export function createInitialTasks(): { active: GameTask[]; pendingTimed: GameTask[] } {
  return {
    active: dailyTaskTemplates.map(cloneTask),
    pendingTimed: timedTaskTemplates.map(cloneTask),
  };
}
