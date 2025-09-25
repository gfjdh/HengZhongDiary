// 角色属性类型
export interface CharacterAttributes {
  // 静态属性
  intelligence: number;      // 智商
  patience: number;         // 耐性
  stamina: number;          // 体力
  personality: string[];    // 性格标签
  
  // 动态属性
  energy: number;           // 精力
  mood: number;            // 心情 (-100 ~ 100)
  mentalHealth: number;     // 心理素质
  learningMotivation: number; // 学习动力
  learningMomentum: number; // 学习劲头
  physicalHealth: number;   // 身体健康
  stress: number;          // 压力
  
  // 成长属性
  knowledge: Record<Subject, number>;      // 知识储备
  skills: Record<Subject, number>;         // 做题技巧
  
  // 临时效果
  temporaryEffects: TemporaryEffect[];
}

// 学科类型
export type Subject = 'chinese' | 'math' | 'english' | 'physics' | 'chemistry' | 'biology';

// 学习状态
export type LearningState = 'focused' | 'normal' | 'slacking' | 'breakdown' | 'flow' | 'overexcited';

// 学习状态配置
export interface LearningStateConfig {
  id: LearningState;
  name: string;
  description: string;
  requirements?: ActionRequirement[];
  modifiers: AttributeModifier[];
  studyEfficiencyMultiplier?: number;
  energyCostMultiplier?: number;
  taskEfficiencyMultiplier?: number;
}

// 时间段类型
export type TimeSlot = 
  | 'morning_wash' | 'morning_exercise' | 'morning_reading'
  | 'breakfast' | 'class_1' | 'class_2' | 'big_break' | 'class_3' | 'class_4' | 'class_5'
  | 'lunch' | 'noon_rest' | 'class_6' | 'class_7' | 'class_8' | 'class_9' | 'class_10'
  | 'dinner' | 'evening_news' | 'self_study_1' | 'self_study_2' | 'self_study_3'
  | 'evening_wash' | 'night_rest';

export type DayKind = 'tutorial' | 'teaching' | 'weekly_exam' | 'exam' | 'holiday';

export interface TimeSlotDefinition {
  id: TimeSlot;
  label: string;
  category: 'routine' | 'class' | 'self_study' | 'break' | 'exam' | 'event' | 'rest' | 'social';
  duration: number; // 时间段长度（分钟）
  defaultAction: string;
  availableActions: string[];
}

export interface DayTemplate {
  id: string;
  name: string;
  kind: DayKind;
  slots: TimeSlotDefinition[];
}

export interface GameCalendar {
  weeks: Array<{
    teachingDays: number;
    weeklyExam?: boolean;
    notes?: string;
  }>;
}

export interface GameSchedule {
  templates: Record<string, DayTemplate>;
  order: string[]; // 对应 DayTemplate id
}

export type ActionCategory = 'study' | 'rest' | 'social' | 'task' | 'event' | 'system' | 'routine';

export interface ActionRequirement {
  type: 'attribute' | 'state' | 'time' | 'resource';
  target: string;
  comparator?: 'gte' | 'lte' | 'eq' | 'ne' | 'gt' | 'lt';
  value: number | string | boolean;
}

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  duration?: number;
  requirements?: ActionRequirement[];
  effects: EventEffect[];
  tags?: string[];
  taskProgress?: number;
}

// 临时效果
export interface TemporaryEffect {
  id: string;
  name: string;
  description: string;
  duration: number; // 剩余时间段数
  modifiers: AttributeModifier[];
}

// 属性修改器
export interface AttributeModifier {
  target: keyof CharacterAttributes | `${keyof CharacterAttributes}.${string}`;
  value: number;
  type: 'add' | 'multiply';
  clamp?: {
    min?: number;
    max?: number;
  };
}

// 游戏状态
export interface GameState {
  phase: 'tutorial' | 'regular' | 'endgame';
  currentWeek: number;
  currentDayIndex: number;
  currentTimeSlotIndex: number;
  currentDayTemplateId: string;
  schedule: GameSchedule;
  character: CharacterAttributes;
  learningState: LearningState;
  learningStates: Record<LearningState, LearningStateConfig>;
  calendar: GameCalendar;
  teacherRelations: Record<string, number>;
  classmateRelations: Record<string, number>;
  activeTasks: GameTask[];
  completedTasks: GameTask[];
  eventHistory: GameEvent[];
  upcomingEvents: PendingEvent[];
  notifications: GameNotification[];
}

// 游戏任务
export interface GameTask {
  id: string;
  name: string;
  type: 'daily' | 'timed';
  subject?: Subject;
  workload: number;
  progress: number;
  deadline?: number; // 剩余天数
  priority: 'required' | 'optional';
}

// 游戏事件
export interface GameEvent {
  id: string;
  name: string;
  description: string;
  triggerConditions: EventTriggerCondition[];
  choices: EventChoice[];
  weight?: number;
}

// 事件触发条件
export interface EventTriggerCondition {
  type: 'time' | 'attribute' | 'relationship' | 'previousEvent';
  condition: any;
}

// 事件选择
export interface EventChoice {
  text: string;
  effects: EventEffect[];
  nextEvent?: string;
}

// 事件效果
export interface EventEffect {
  type: 'attribute' | 'relationship' | 'unlock' | 'trigger';
  target: string;
  value: any;
}

export interface PendingEvent {
  id: string;
  triggerAt: {
    week: number;
    dayIndex: number;
    timeSlotIndex?: number;
  };
  event: GameEvent;
}

export interface GameNotification {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'danger';
}