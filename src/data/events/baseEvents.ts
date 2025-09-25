import type { GameEvent } from '../../types/game';

export const baseEvents: GameEvent[] = [
  {
    id: 'orientation-welcome',
    name: '新生欢迎',
    description: '班主任带领大家熟悉校园，顺便强调纪律。',
    triggerConditions: [
      {
        type: 'time',
        condition: {
          week: 1,
          dayIndex: 0,
        },
      },
    ],
    choices: [
      {
        text: '认真聆听',
        effects: [
          {
            type: 'attribute',
            target: 'character',
            value: [
              { target: 'learningMotivation', type: 'add', value: 5, clamp: { min: 0, max: 100 } },
            ],
          },
          {
            type: 'relationship',
            target: 'teacher:head',
            value: 3,
          },
        ],
      },
      {
        text: '和同学聊八卦',
        effects: [
          {
            type: 'relationship',
            target: 'classmate:friend',
            value: 3,
          },
          {
            type: 'attribute',
            target: 'character',
            value: [
              { target: 'learningMomentum', type: 'add', value: -4, clamp: { min: 0, max: 100 } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'weekly-report',
    name: '周测成绩公布',
    description: '老师公布本周的周测成绩并进行点评。',
    triggerConditions: [
      {
        type: 'time',
        condition: {
          dayIndex: 0,
          timeSlotIndex: 3,
        },
      },
      {
        type: 'previousEvent',
        condition: {
          eventId: 'orientation-welcome',
        },
      },
    ],
    choices: [
      {
        text: '虚心接受',
        effects: [
          {
            type: 'attribute',
            target: 'character',
            value: [
              { target: 'stress', type: 'add', value: -6, clamp: { min: 0, max: 100 } },
              { target: 'learningMotivation', type: 'add', value: 4, clamp: { min: 0, max: 100 } },
            ],
          },
        ],
      },
      {
        text: '暗自较劲',
        effects: [
          {
            type: 'attribute',
            target: 'character',
            value: [
              { target: 'stress', type: 'add', value: 6, clamp: { min: 0, max: 100 } },
              { target: 'learningMomentum', type: 'add', value: 6, clamp: { min: 0, max: 100 } },
            ],
          },
        ],
      },
    ],
  },
];
