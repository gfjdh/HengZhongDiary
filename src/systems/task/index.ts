import type { GameNotification, GameTask } from '../../types/game';

export interface TaskProgressPayload {
  taskId: string;
  increment: number;
  clamp?: boolean;
}

export interface TaskProgressResult {
  activeTasks: GameTask[];
  completedTasks: GameTask[];
  notifications: GameNotification[];
}

export function updateTaskProgress(
  activeTasks: GameTask[],
  completedTasks: GameTask[],
  payload: TaskProgressPayload,
): TaskProgressResult {
  const { taskId, increment, clamp = true } = payload;
  const notifications: GameNotification[] = [];

  const taskIndex = activeTasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return { activeTasks, completedTasks, notifications };
  }

  const originalTask = activeTasks[taskIndex];
  if (!originalTask) {
    return { activeTasks, completedTasks, notifications };
  }
  const task: GameTask = {
    id: originalTask.id,
    name: originalTask.name,
    type: originalTask.type,
    subject: originalTask.subject,
    workload: originalTask.workload,
    progress: originalTask.progress,
    deadline: originalTask.deadline,
    priority: originalTask.priority,
  };
  const nextProgress = clamp
    ? Math.min(task.workload, task.progress + increment)
    : task.progress + increment;
  task.progress = nextProgress;

  const updatedActive = [...activeTasks];

  if (task.progress >= task.workload) {
    const finishedTask: GameTask = { ...task, progress: task.workload };
    updatedActive.splice(taskIndex, 1);
    return {
      activeTasks: updatedActive,
      completedTasks: [...completedTasks, finishedTask],
      notifications: [
        ...notifications,
        {
          id: `task-finished-${finishedTask.id}`,
          timestamp: new Date().toISOString(),
          message: `任务「${finishedTask.name}」已完成。`,
          level: 'success',
        },
      ],
    };
  }

  updatedActive.splice(taskIndex, 1, task);

  return {
    activeTasks: updatedActive,
    completedTasks,
    notifications,
  };
}

export function tickTimedTasks(tasks: GameTask[]): GameTask[] {
  return tasks.map((task) => {
    if (task.type === 'timed' && typeof task.deadline === 'number') {
      return { ...task, deadline: Math.max(task.deadline - 1, 0) };
    }
    return task;
  });
}

export function expireTimedTasks(tasks: GameTask[]): { active: GameTask[]; expired: GameTask[] } {
  const active: GameTask[] = [];
  const expired: GameTask[] = [];

  tasks.forEach((task) => {
    if (task.type === 'timed' && typeof task.deadline === 'number' && task.deadline <= 0) {
      expired.push(task);
      return;
    }
    active.push(task);
  });

  return { active, expired };
}

export function addTasks(activeTasks: GameTask[], newTasks: GameTask[]): GameTask[] {
  const existingIds = new Set(activeTasks.map((task) => task.id));
  const filteredTasks = newTasks.filter((task) => !existingIds.has(task.id));
  return [...activeTasks, ...filteredTasks];
}
export type Task = {
  id: string;
  title: string;
  done?: boolean;
};

export const sampleTasks: Task[] = [
  { id: 'task-1', title: 'Sample Task', done: false },
];
