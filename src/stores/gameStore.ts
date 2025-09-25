import { defineStore } from 'pinia';
import { computed } from 'vue';
import type {
  ActionDefinition,
  ActionRequirement,
  AttributeModifier,
  GameNotification,
  GameState,
  LearningState,
  LearningStateConfig,
} from '../types/game';
import {
  advanceTimeSlot,
  createDefaultSchedule,
  getCurrentDayTemplate,
  getTimeSlotDefinition,
} from '../systems/time/TimeSystem';
import { getActionDefinition, listActionDefinitions } from '../systems/action/action';
import { addTasks, expireTimedTasks, tickTimedTasks, updateTaskProgress } from '../systems/task/task';
import { applyTemporaryEffects, reduceTemporaryEffects } from '../systems/attribute/AttributeSystem';
import { applyEventOutcome, evaluateEvents, resolveEventEffects } from '../systems/event/EventSystem';
import { baseEvents } from '../data/events/baseEvents';
import { cloneTask, createInitialTasks, dailyTaskTemplates } from '../data/tasks/baseTasks';
import { sampleTeachers } from '../systems/teacher/teacher';
import { sampleClassmates } from '../systems/classmate/classmate';

const BASE_VERSION = '0.1.0';
const NOTIFICATION_LIMIT = 25;

const learningStateConfigs: Record<LearningState, LearningStateConfig> = {
  focused: {
    id: 'focused',
    name: '专注',
    description: '全力以赴，效率大幅提升但更加疲劳。',
    canBeChoice: true,
    requirements: [
      { type: 'attribute', target: 'energy', comparator: 'gte', value: 60 },
      { type: 'attribute', target: 'learningMomentum', comparator: 'gte', value: 40 },
    ],
    modifiers: [
      { target: 'energy', type: 'add', value: -2, clamp: { min: 0, max: 100 } },
      { target: 'learningMomentum', type: 'add', value: -4, clamp: { min: 0, max: 100 } },
    ],
    studyEfficiencyMultiplier: 1.2,
    energyCostMultiplier: 1.25,
    taskEfficiencyMultiplier: 1.1,
  },
  normal: {
    id: 'normal',
    name: '平常',
    description: '保持节奏，兼顾效率与状态。',
    canBeChoice: true,
    modifiers: [],
    studyEfficiencyMultiplier: 1,
    energyCostMultiplier: 1,
    taskEfficiencyMultiplier: 1,
  },
  slacking: {
    id: 'slacking',
    name: '摸鱼',
    description: '刻意放松，维持体力但效率下降。',
    canBeChoice: true,
    requirements: [
      { type: 'attribute', target: 'energy', comparator: 'lte', value: 45 },
      { type: 'attribute', target: 'learningMomentum', comparator: 'lte', value: 30 },
    ],
    modifiers: [
      { target: 'stress', type: 'add', value: -3, clamp: { min: 0, max: 100 } },
    ],
    studyEfficiencyMultiplier: 0.6,
    energyCostMultiplier: 0.75,
    taskEfficiencyMultiplier: 0.8,
  },
  breakdown: {
    id: 'breakdown',
    name: '崩溃',
    description: '精神濒临崩溃，需要紧急恢复。',
    canBeChoice: false,
    modifiers: [
      { target: 'mood', type: 'add', value: -10, clamp: { min: -100, max: 100 } },
      { target: 'stress', type: 'add', value: 8, clamp: { min: 0, max: 100 } },
    ],
    studyEfficiencyMultiplier: 0.3,
    energyCostMultiplier: 1.5,
    taskEfficiencyMultiplier: 0.5,
  },
  flow: {
    id: 'flow',
    name: '心流',
    description: '身心合一，持续高效输出。',
    canBeChoice: false,
    modifiers: [
      { target: 'learningMomentum', type: 'add', value: 4, clamp: { min: 0, max: 100 } },
      { target: 'stress', type: 'add', value: -6, clamp: { min: 0, max: 100 } },
    ],
    studyEfficiencyMultiplier: 1.35,
    energyCostMultiplier: 0.9,
    taskEfficiencyMultiplier: 1.2,
  },
  overexcited: {
    id: 'overexcited',
    name: '躁动',
    description: '兴奋过度，难以集中。',
    canBeChoice: false,
    modifiers: [
      { target: 'mood', type: 'add', value: 5, clamp: { min: -100, max: 100 } },
      { target: 'energy', type: 'add', value: -4, clamp: { min: 0, max: 100 } },
    ],
    studyEfficiencyMultiplier: 0.8,
    energyCostMultiplier: 0.9,
    taskEfficiencyMultiplier: 0.9,
  },
};

type NotificationLevel = GameNotification['level'];

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createInitialCharacter(): GameState['character'] {
  return {
    intelligence: 72,
    patience: 68,
    stamina: 70,
    personality: ['responsible', 'introvert'],
    energy: 70,
    mood: 10,
    mentalHealth: 65,
    learningMotivation: 55,
    learningMomentum: 50,
    physicalHealth: 75,
    stress: 30,
    knowledge: {
      chinese: 40,
      math: 38,
      english: 42,
      physics: 30,
      chemistry: 28,
      biology: 32,
    },
    skills: {
      chinese: 35,
      math: 34,
      english: 36,
      physics: 24,
      chemistry: 22,
      biology: 26,
    },
    temporaryEffects: [],
  };
}

function createInitialNotifications(): GameNotification[] {
  return [
    {
      id: 'welcome',
      timestamp: new Date().toISOString(),
      message: '欢迎来到衡中日记，开始你的高三旅程！',
      level: 'info',
    },
  ];
}

function createInitialState(): GameState {
  const schedule = createDefaultSchedule();
  const { active, pendingTimed } = createInitialTasks();
  const startingTasks = addTasks([...active], pendingTimed);

  return {
    phase: 'tutorial',
    currentWeek: 1,
    currentDayIndex: 0,
    currentTimeSlotIndex: 0,
    currentDayTemplateId: schedule.order[0] ?? 'teaching-default',
    schedule,
    character: createInitialCharacter(),
    learningState: 'normal',
    learningStates: deepClone(learningStateConfigs),
    calendar: {
      weeks: [
        { teachingDays: 5, weeklyExam: true, notes: '开学适应周' },
        { teachingDays: 5, weeklyExam: true, notes: '巩固基础周' },
      ],
    },
    teacherRelations: sampleTeachers.reduce<Record<string, number>>((acc, teacher) => {
      acc[teacher.id] = 0;
      return acc;
    }, {}),
    classmateRelations: sampleClassmates.reduce<Record<string, number>>((acc, classmate) => {
      acc[classmate.id] = classmate.relation === 'friend' ? 10 : 0;
      return acc;
    }, {}),
    activeTasks: startingTasks,
    completedTasks: [],
    eventHistory: [],
    upcomingEvents: [],
    notifications: createInitialNotifications(),
  };
}

function meetsRequirement(state: GameState, requirement: ActionRequirement): boolean {
  const { type } = requirement;
  switch (type) {
    case 'attribute': {
      const value = getNestedNumber(state.character, requirement.target);
      if (value === undefined) return false;
      return compare(value, requirement.comparator ?? 'gte', Number(requirement.value));
    }
    case 'state':
      return state.learningState === requirement.value;
    case 'time': {
      const expected = requirement.value as { dayIndex?: number; timeSlotIndex?: number };
      if (expected.dayIndex !== undefined && state.currentDayIndex !== expected.dayIndex) {
        return false;
      }
      if (expected.timeSlotIndex !== undefined && state.currentTimeSlotIndex !== expected.timeSlotIndex) {
        return false;
      }
      return true;
    }
    case 'resource':
      return true;
    default:
      return false;
  }
}

function compare(value: number, comparator: string, expected: number): boolean {
  switch (comparator) {
    case 'gt':
      return value > expected;
    case 'gte':
      return value >= expected;
    case 'lt':
      return value < expected;
    case 'lte':
      return value <= expected;
    case 'ne':
      return value !== expected;
    case 'eq':
    default:
      return value === expected;
  }
}

function formatRequirement(requirement: ActionRequirement): string {
  switch (requirement.type) {
    case 'attribute':
      return `${requirement.target} ${requirement.comparator ?? '>= '} ${requirement.value}`;
    case 'state':
      return `状态需要「${requirement.value}」`;
    case 'time': {
      const raw = requirement.value;
      if (raw && typeof raw === 'object') {
        const parts = Object.entries(raw as Record<string, unknown>)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val ?? '-'}`)
          .join('，');
        return parts ? `限定时间：${parts}` : '限定时间条件';
      }
      return '限定时间条件';
    }
    case 'resource':
      return `资源要求：${String(requirement.value)}`;
    default:
      return '未知条件';
  }
}

function getNestedNumber(target: any, path: string): number | undefined {
  const segments = path.split('.');
  let current = target;
  for (const segment of segments) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return typeof current === 'number' ? current : undefined;
}

function applyLearningStateScaling(
  modifiers: AttributeModifier[],
  action: ActionDefinition,
  config?: LearningStateConfig,
): AttributeModifier[] {
  if (!config) return modifiers;
  return modifiers.map((modifier) => {
    const next = { ...modifier };
    if (next.target === 'energy' && config.energyCostMultiplier && action.category !== 'rest') {
      next.value *= config.energyCostMultiplier;
    }
    if (
      typeof next.target === 'string'
      && next.target.startsWith('knowledge.')
      && config.studyEfficiencyMultiplier
      && action.category === 'study'
    ) {
      next.value *= config.studyEfficiencyMultiplier;
    }
    if (
      typeof next.target === 'string'
      && next.target.startsWith('skills.')
      && config.studyEfficiencyMultiplier
      && action.category === 'study'
    ) {
      next.value *= config.studyEfficiencyMultiplier;
    }
    if (
      action.category === 'task'
      && config.taskEfficiencyMultiplier
      && typeof next.target === 'string'
      && next.target.startsWith('knowledge.')
    ) {
      next.value *= config.taskEfficiencyMultiplier;
    }
    return next;
  });
}

function mergeNotifications(
  existing: GameNotification[],
  additions: GameNotification[],
  limit = NOTIFICATION_LIMIT,
): GameNotification[] {
  const merged = [...additions, ...existing];
  return merged.slice(0, limit);
}

type GameStoreState = GameState & { version: string };

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => ({
    version: BASE_VERSION,
    ...createInitialState(),
  }),
  getters: {
    currentDayTemplate: (state) => getCurrentDayTemplate(state.schedule, state.currentDayTemplateId),
    currentTimeSlot: (state) => getTimeSlotDefinition(
      state.schedule,
      state.currentDayTemplateId,
      state.currentTimeSlotIndex,
    ),
    availableActions(state) {
      const slot = getTimeSlotDefinition(
        state.schedule,
        state.currentDayTemplateId,
        state.currentTimeSlotIndex,
      );
      return listActionDefinitions(slot.availableActions ?? []);
    },
    nextMajorEvent(state) {
      return state.upcomingEvents[0]?.event?.name ?? null;
    },
  },
  actions: {
    reset() {
      Object.assign(this, { version: BASE_VERSION, ...createInitialState() });
    },
    addNotification(message: string, level: NotificationLevel = 'info') {
      const notification: GameNotification = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: new Date().toISOString(),
        message,
        level,
      };
      this.notifications = mergeNotifications(this.notifications, [notification]);
    },
    removeNotification(id: string) {
      this.notifications = this.notifications.filter((notification) => notification.id !== id);
    },
    clearNotifications() {
      this.notifications = [];
    },
    canSwitchLearningState(target: LearningState) {
      const config = this.learningStates[target];
      if (!config) {
        return { ok: false, reasons: ['状态不存在'] } as const;
      }
      const unmet = (config.requirements ?? []).filter((req) => !meetsRequirement(this, req));
      return {
        ok: unmet.length === 0,
        reasons: unmet.map((req) => formatRequirement(req)),
      } as const;
    },
    switchLearningState(target: LearningState) {
      const config = this.learningStates[target];
      if (!config) {
        this.addNotification(`学习状态 ${target} 不存在`, 'warning');
        return false;
      }
      const result = this.canSwitchLearningState(target);
      if (!result.ok) {
        this.addNotification(`未满足切换至「${config.name}」的条件：${result.reasons.join('；')}`, 'warning');
        return false;
      }
      this.learningState = target;
      this.addNotification(`学习状态切换为「${config.name}」`, 'success');
      return true;
    },
    canPerformAction(actionOrId: string | ActionDefinition) {
      const action = typeof actionOrId === 'string' ? getActionDefinition(actionOrId) : actionOrId;
      const unmet = (action.requirements ?? []).filter((req) => !meetsRequirement(this, req));
      return {
        action,
        ok: unmet.length === 0,
        reasons: unmet.map((req) => formatRequirement(req)),
      } as const;
    },
    performAction(actionId: string, options?: { taskId?: string }) {
      const { action, ok, reasons } = this.canPerformAction(actionId);
      if (!ok) {
        this.addNotification(`无法执行「${action.name}」：${reasons.join('；')}`, 'warning');
        return;
      }
      const learningConfig = this.learningStates[this.learningState];
      const outcome = resolveEventEffects(action.effects);
      outcome.characterModifiers = applyLearningStateScaling(
        [...outcome.characterModifiers, ...(learningConfig?.modifiers ?? [])],
        action,
        learningConfig,
      );

      const {
        character,
        teacherRelations,
        classmateRelations,
        notifications,
        scheduledEvents,
      } = applyEventOutcome(this, outcome);

      this.character = {
        ...applyTemporaryEffects(character, character.temporaryEffects ?? []),
        temporaryEffects: reduceTemporaryEffects(this.character.temporaryEffects ?? []),
      };
      this.teacherRelations = teacherRelations;
      this.classmateRelations = classmateRelations;
      if (notifications.length) {
        this.notifications = mergeNotifications(this.notifications, notifications);
      }
      if (scheduledEvents.length) {
        this.upcomingEvents.push(...scheduledEvents);
      }

      if (action.taskProgress && this.activeTasks.length) {
        const firstTask = this.activeTasks[0];
        const targetTaskId = options?.taskId ?? firstTask?.id;
        if (!targetTaskId) {
          this.addNotification('没有可推进的任务', 'warning');
          return;
        }
        const { activeTasks, completedTasks, notifications: taskNotices } = updateTaskProgress(
          this.activeTasks,
          this.completedTasks,
          { taskId: targetTaskId, increment: action.taskProgress },
        );
        this.activeTasks = activeTasks;
        this.completedTasks = completedTasks;
        if (taskNotices.length) {
          this.notifications = mergeNotifications(this.notifications, taskNotices);
        }
      }

      const event = evaluateEvents(this, baseEvents);
      if (event) {
        this.upcomingEvents.push({
          id: `pending-${event.id}-${Date.now()}`,
          triggerAt: {
            week: this.currentWeek,
            dayIndex: this.currentDayIndex,
            timeSlotIndex: this.currentTimeSlotIndex + 1,
          },
          event,
        });
      }
    },
    advanceTime() {
      const advance = advanceTimeSlot(
        this.schedule,
        this.currentDayIndex,
        this.currentDayTemplateId,
        this.currentTimeSlotIndex,
      );
      this.currentDayIndex = advance.nextDayIndex;
      this.currentDayTemplateId = advance.nextTemplateId;
      this.currentTimeSlotIndex = advance.nextTimeSlotIndex;

      this.character.temporaryEffects = reduceTemporaryEffects(this.character.temporaryEffects ?? []);

      if (advance.wrappedDay) {
        this.onDayTransition(advance.wrappedWeek);
      }

      this.processScheduledEvents();
    },
    onDayTransition(wrappedWeek: boolean) {
      this.activeTasks = tickTimedTasks(this.activeTasks);
      const { active, expired } = expireTimedTasks(this.activeTasks);
      this.activeTasks = active;
      if (expired.length) {
        expired.forEach((task) => this.addNotification(`任务「${task.name}」逾期未完成`, 'warning'));
      }

      const refreshedDaily = dailyTaskTemplates.map(cloneTask);
      this.activeTasks = addTasks(this.activeTasks, refreshedDaily);

      if (wrappedWeek) {
        this.currentWeek += 1;
        this.addNotification(`进入第 ${this.currentWeek} 周`, 'info');
      }
    },
    processScheduledEvents() {
      const currentKey = `${this.currentWeek}-${this.currentDayIndex}-${this.currentTimeSlotIndex}`;
      const triggered = this.upcomingEvents.filter((pending) => {
        const { week, dayIndex, timeSlotIndex } = pending.triggerAt;
        const key = `${week}-${dayIndex}-${timeSlotIndex ?? this.currentTimeSlotIndex}`;
        return key === currentKey;
      });

      if (!triggered.length) return;

      triggered.forEach((pending) => {
        this.eventHistory.push(pending.event);
        this.addNotification(`触发事件「${pending.event.name}」`, 'info');
      });

      this.upcomingEvents = this.upcomingEvents.filter((pending) => !triggered.includes(pending));
    },
  },
});

export const useGameVersion = () => computed(() => useGameStore().version);
