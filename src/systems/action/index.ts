import type { ActionDefinition, AttributeModifier } from '../../types/game';

function attributeModifier(target: AttributeModifier['target'], value: number, clamp?: AttributeModifier['clamp']): AttributeModifier {
  return {
    target,
    type: 'add',
    value,
    clamp,
  };
}

const DEFAULT_ACTION: ActionDefinition = {
  id: 'rest_short',
  name: '短暂休息',
  description: '利用空档调整状态，恢复少量精力，降低压力。',
  category: 'rest',
  effects: [
    {
      type: 'attribute',
      target: 'character',
      value: [
        attributeModifier('energy', 8, { min: 0, max: 100 }),
        attributeModifier('stress', -5, { min: 0, max: 100 }),
        attributeModifier('mood', 4, { min: -100, max: 100 }),
      ],
    },
  ],
};

const ACTION_LIBRARY: Record<string, ActionDefinition> = {
  [DEFAULT_ACTION.id]: DEFAULT_ACTION,
  default_morning_wash: {
    id: 'default_morning_wash',
    name: '按时洗漱',
    description: '规律作息让精神焕发，精力恢复并降低压力。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 6, { min: 0, max: 100 }),
          attributeModifier('stress', -2, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  lazy_sleep: {
    id: 'lazy_sleep',
    name: '再睡五分钟',
    description: '多睡一会儿提升精力，但可能错过早训。',
    category: 'rest',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 10, { min: 0, max: 100 }),
          attributeModifier('learningMomentum', -3, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  shout_floor: {
    id: 'shout_floor',
    name: '喊楼互助',
    description: '帮助同学叫早，提升人际关系。',
    category: 'social',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [attributeModifier('learningMomentum', 4, { min: 0, max: 100 })],
      },
      {
        type: 'relationship',
        target: 'classmate:monitor',
        value: 2,
      },
    ],
  },
  default_morning_exercise: {
    id: 'default_morning_exercise',
    name: '认真早操',
    description: '按要求完成早操，消耗体力但利于健康。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -6, { min: 0, max: 100 }),
          attributeModifier('physicalHealth', 3, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  literature_review: {
    id: 'literature_review',
    name: '语文早读',
    description: '沉浸式朗读语文课文，提升语文积累。',
    category: 'study',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('knowledge.chinese', 6),
          attributeModifier('skills.chinese', 2),
          attributeModifier('energy', -4, { min: 0, max: 100 }),
          attributeModifier('learningMomentum', -2, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  task_progress: {
    id: 'task_progress',
    name: '推进任务',
    description: '专注处理待办任务，按进度积攒完成度。',
    category: 'task',
    taskProgress: 20,
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -6, { min: 0, max: 100 }),
          attributeModifier('stress', 4, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  default_breakfast: {
    id: 'default_breakfast',
    name: '正常吃早餐',
    description: '按部就班吃早餐，恢复精力。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 8, { min: 0, max: 100 }),
          attributeModifier('stress', -3, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  rush_breakfast: {
    id: 'rush_breakfast',
    name: '匆忙早餐',
    description: '跑着吃早餐，节约时间但心情略差。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 4, { min: 0, max: 100 }),
          attributeModifier('mood', -4, { min: -100, max: 100 }),
        ],
      },
    ],
  },
  detention_breakfast: {
    id: 'detention_breakfast',
    name: '留堂补作业',
    description: '利用早餐时间赶作业，效率高但身体吃不消。',
    category: 'task',
    taskProgress: 25,
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -10, { min: 0, max: 100 }),
          attributeModifier('physicalHealth', -4, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  free_activity: {
    id: 'free_activity',
    name: '自由活动',
    description: '和同学放松聊天，调整身心状态。',
    category: 'social',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 8, { min: -100, max: 100 }),
          attributeModifier('energy', -2, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  attend_class_chinese: createClassAction('attend_class_chinese', '语文课堂', 'chinese'),
  attend_class_math: createClassAction('attend_class_math', '数学课堂', 'math'),
  attend_class_english: createClassAction('attend_class_english', '英语课堂', 'english'),
  attend_class_physics: createClassAction('attend_class_physics', '物理课堂', 'physics'),
  attend_class_chemistry: createClassAction('attend_class_chemistry', '化学课堂', 'chemistry'),
  attend_class_biology: createClassAction('attend_class_biology', '生物课堂', 'biology'),
  attend_class_history: createClassAction('attend_class_history', '历史课堂', 'chinese'),
  attend_class_geography: createClassAction('attend_class_geography', '地理课堂', 'chinese'),
  attend_class_political: createClassAction('attend_class_political', '政治课堂', 'chinese'),
  attend_class_optional: createClassAction('attend_class_optional', '选修课堂', 'chinese'),
  self_study: createSelfStudyAction('self_study', '自习', 1.0),
  watch_news: {
    id: 'watch_news',
    name: '看新闻',
    description: '了解世界动态，拓宽视野。',
    category: 'event',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 3, { min: -100, max: 100 }),
          attributeModifier('stress', -2, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  consult_teacher: {
    id: 'consult_teacher',
    name: '请教老师',
    description: '向老师请教难题，提升解题技巧。',
    category: 'study',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('skills.math', 6),
          attributeModifier('skills.physics', 4),
          attributeModifier('energy', -6, { min: 0, max: 100 }),
        ],
      },
      {
        type: 'relationship',
        target: 'teacher:math',
        value: 3,
      },
    ],
  },
  default_lunch: {
    id: 'default_lunch',
    name: '正常午餐',
    description: '营养午餐恢复精力，缓解压力。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 12, { min: 0, max: 100 }),
          attributeModifier('stress', -5, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  rush_lunch: {
    id: 'rush_lunch',
    name: '快餐解决',
    description: '快速解决午餐，留出时间任务。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 6, { min: 0, max: 100 }),
          attributeModifier('stress', -1, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  detention_lunch: {
    id: 'detention_lunch',
    name: '留堂午餐',
    description: '留在教室完成任务，效率高但身体吃不消。',
    category: 'task',
    taskProgress: 30,
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -12, { min: 0, max: 100 }),
          attributeModifier('physicalHealth', -6, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  review_math: createReviewAction('review_math', '数学讲评', 'math'),
  review_english: createReviewAction('review_english', '英语讲评', 'english'),
  review_chinese: createReviewAction('review_chinese', '语文讲评', 'chinese'),
  take_nap: {
    id: 'take_nap',
    name: '午休小憩',
    description: '午休让精力恢复，为下午课堂做准备。',
    category: 'rest',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 18, { min: 0, max: 100 }),
          attributeModifier('stress', -4, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  night_reading: {
    id: 'night_reading',
    name: '夜读自习',
    description: '牺牲休息时间换取一点知识积累。',
    category: 'study',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('knowledge.chinese', 4),
          attributeModifier('skills.chinese', 2),
          attributeModifier('energy', -10, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  default_dinner: {
    id: 'default_dinner',
    name: '正常晚餐',
    description: '给晚上自习蓄力的普通晚餐。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 10, { min: 0, max: 100 }),
          attributeModifier('stress', -3, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  rush_dinner: {
    id: 'rush_dinner',
    name: '赶时间的晚餐',
    description: '快速打包吃饭，多出时间做事。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [attributeModifier('energy', 6, { min: 0, max: 100 })],
      },
      {
        type: 'relationship',
        target: 'classmate:roommate',
        value: 1,
      },
    ],
  },
  detention_dinner: {
    id: 'detention_dinner',
    name: '晚餐留堂',
    description: '继续赶任务，效率高但健康下滑。',
    category: 'task',
    taskProgress: 30,
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -14, { min: 0, max: 100 }),
          attributeModifier('physicalHealth', -5, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  self_study_primary: createSelfStudyAction('self_study_primary', '高效自习', 1.2),
  self_study_secondary: createSelfStudyAction('self_study_secondary', '稳态自习', 1.0),
  self_study_optional: createSelfStudyAction('self_study_optional', '轻松自习', 0.8),
  sleep_in: {
    id: 'sleep_in',
    name: '睡个懒觉',
    description: '假期补觉，恢复大量精力。',
    category: 'rest',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 20, { min: 0, max: 100 }),
          attributeModifier('stress', -6, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  exercise: {
    id: 'exercise',
    name: '户外锻炼',
    description: '加强锻炼提升体能与心情。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('physicalHealth', 6, { min: 0, max: 100 }),
          attributeModifier('mood', 6, { min: -100, max: 100 }),
          attributeModifier('energy', -6, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  holiday_breakfast: {
    id: 'holiday_breakfast',
    name: '慢享早午餐',
    description: '享受假期美食，恢复精力。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 12, { min: 0, max: 100 }),
          attributeModifier('mood', 8, { min: -100, max: 100 }),
        ],
      },
    ],
  },
  eat_out: {
    id: 'eat_out',
    name: '外出觅食',
    description: '和同学外出吃饭，放松心情。',
    category: 'social',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 10, { min: -100, max: 100 }),
          attributeModifier('energy', 6, { min: 0, max: 100 }),
        ],
      },
    ],
    tags: ['holiday'],
  },
  meet_friends: {
    id: 'meet_friends',
    name: '约朋友玩',
    description: '和朋友相聚放松，增进同学关系。',
    category: 'social',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 12, { min: -100, max: 100 }),
          attributeModifier('energy', -4, { min: 0, max: 100 }),
        ],
      },
      {
        type: 'relationship',
        target: 'classmate:friend',
        value: 4,
      },
    ],
  },
  homework: {
    id: 'homework',
    name: '完成作业',
    description: '假期里完成学习任务，推进进度。',
    category: 'task',
    taskProgress: 25,
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -8, { min: 0, max: 100 }),
          attributeModifier('stress', 5, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  holiday_lunch: {
    id: 'holiday_lunch',
    name: '假日午餐',
    description: '和家人共进午餐，放松心情。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 10, { min: 0, max: 100 }),
          attributeModifier('mood', 6, { min: -100, max: 100 }),
        ],
      },
    ],
  },
  family_time: {
    id: 'family_time',
    name: '家庭时光',
    description: '与家人交流，稳定情绪。',
    category: 'social',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 10, { min: -100, max: 100 }),
          attributeModifier('stress', -6, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  holiday_dinner: {
    id: 'holiday_dinner',
    name: '家宴晚餐',
    description: '丰盛晚餐让人心情愉悦。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 14, { min: 0, max: 100 }),
          attributeModifier('mood', 8, { min: -100, max: 100 }),
        ],
      },
    ],
  },
  holiday_snack: {
    id: 'holiday_snack',
    name: '宵夜小食',
    description: '夜宵满足味蕾，略有负担。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 6, { min: -100, max: 100 }),
          attributeModifier('physicalHealth', -2, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  journal_time: {
    id: 'journal_time',
    name: '写日记',
    description: '整理心情，记录成长。',
    category: 'event',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 6, { min: -100, max: 100 }),
          attributeModifier('stress', -4, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  reflect_holiday: {
    id: 'reflect_holiday',
    name: '总结假期',
    description: '回顾假期收获，明确方向。',
    category: 'event',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('learningMotivation', 8, { min: 0, max: 100 }),
          attributeModifier('stress', -3, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  prepare_school: {
    id: 'prepare_school',
    name: '调整状态',
    description: '为新学期做好准备，重拾节奏。',
    category: 'event',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('learningMomentum', 6, { min: 0, max: 100 }),
          attributeModifier('energy', -4, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  default_evening_wash: {
    id: 'default_evening_wash',
    name: '按时洗漱',
    description: '规律晚间流程，有助于入睡。',
    category: 'routine',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [attributeModifier('stress', -2, { min: 0, max: 100 })],
      },
    ],
  },
  detention_evening: {
    id: 'detention_evening',
    name: '晚间加练',
    description: '牺牲休息时间完成任务。',
    category: 'task',
    taskProgress: 20,
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -12, { min: 0, max: 100 }),
          attributeModifier('physicalHealth', -5, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  sleep: {
    id: 'sleep',
    name: '规律睡眠',
    description: '保证高质量睡眠，恢复大量精力。',
    category: 'rest',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', 35, { min: 0, max: 100 }),
          attributeModifier('stress', -10, { min: 0, max: 100 }),
          attributeModifier('physicalHealth', 4, { min: 0, max: 100 }),
        ],
      },
    ],
  },
  exam_chinese: createExamAction('exam_chinese', '语文周测', 1.0),
  exam_math: createExamAction('exam_math', '数学周测', 1.0),
  exam_english: createExamAction('exam_english', '英语周测', 1.0),
  exam_physics: createExamAction('exam_physics', '物理周测', 1.0),
  exam_chemistry: createExamAction('exam_chemistry', '化学周测', 1.0),
  exam_relax: {
    id: 'exam_relax',
    name: '调整状态',
    description: '考试空档稍作休息，保持状态。',
    category: 'rest',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [attributeModifier('mood', 4, { min: -100, max: 100 })],
      },
    ],
  },
  class_meeting: {
    id: 'class_meeting',
    name: '班会总结',
    description: '总结本周收获，调整全班状态。',
    category: 'event',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [attributeModifier('learningMotivation', 6, { min: 0, max: 100 })],
      },
    ],
  },
  movie_time: {
    id: 'movie_time',
    name: '观影活动',
    description: '看电影放松身心。',
    category: 'rest',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('mood', 12, { min: -100, max: 100 }),
          attributeModifier('stress', -8, { min: 0, max: 100 }),
        ],
      },
    ],
  },
};

function createClassAction(id: string, name: string, subject: string): ActionDefinition {
  return {
    id,
    name,
    description: `${name}提升${subject}相关知识与做题能力。`,
    category: 'study',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier(`knowledge.${subject}` as AttributeModifier['target'], 8),
          attributeModifier(`skills.${subject}` as AttributeModifier['target'], 5),
          attributeModifier('energy', -8, { min: 0, max: 100 }),
          attributeModifier('stress', 3, { min: 0, max: 100 }),
        ],
      },
    ],
  };
}

function createSelfStudyAction(id: string, name: string, efficiency: number): ActionDefinition {
  return {
    id,
    name,
    description: `${name}可以自由选择科目，提升知识和技巧。`,
    category: 'study',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('knowledge.math', Math.round(5 * efficiency)),
          attributeModifier('skills.math', Math.round(4 * efficiency)),
          attributeModifier('energy', -6, { min: 0, max: 100 }),
        ],
      },
    ],
  };
}

function createReviewAction(id: string, name: string, subject: string): ActionDefinition {
  return {
    id,
    name,
    description: `${name}帮助梳理课堂知识，巩固理解。`,
    category: 'study',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier(`knowledge.${subject}` as AttributeModifier['target'], 5),
          attributeModifier(`skills.${subject}` as AttributeModifier['target'], 4),
          attributeModifier('stress', -4, { min: 0, max: 100 }),
        ],
      },
    ],
  };
}

function createExamAction(id: string, name: string, stressImpact: number): ActionDefinition {
  return {
    id,
    name,
    description: `${name}消耗精力并积累考试经验。`,
    category: 'event',
    effects: [
      {
        type: 'attribute',
        target: 'character',
        value: [
          attributeModifier('energy', -12 * stressImpact, { min: 0, max: 100 }),
          attributeModifier('stress', 6 * stressImpact, { min: 0, max: 100 }),
          attributeModifier('mentalHealth', 2, { min: 0, max: 100 }),
        ],
      },
    ],
  };
}

export function getActionDefinition(actionId: string): ActionDefinition {
  return ACTION_LIBRARY[actionId] ?? DEFAULT_ACTION;
}

export function listActionDefinitions(actionIds: string[]): ActionDefinition[] {
  return actionIds.map((id) => getActionDefinition(id));
}

export function getAllActions(): ActionDefinition[] {
  return Object.values(ACTION_LIBRARY);
}
