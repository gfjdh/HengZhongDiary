import type {
	DayTemplate,
	GameSchedule,
	TimeSlotDefinition,
} from '../../types/game';

const MINUTES_PER_SLOT = 30;

const teachingSlots: TimeSlotDefinition[] = [
	{ id: 'morning_wash', label: '早洗漱', category: 'routine', duration: 20, defaultAction: 'default_morning_wash', availableActions: ['default_morning_wash', 'lazy_sleep', 'shout_floor'] },
	{ id: 'morning_exercise', label: '早操', category: 'routine', duration: 20, defaultAction: 'default_morning_exercise', availableActions: ['default_morning_exercise'] },
	{ id: 'morning_reading', label: '早读', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'literature_review', availableActions: ['literature_review', 'task_progress', 'rest_short'] },
	{ id: 'breakfast', label: '早餐', category: 'routine', duration: 20, defaultAction: 'default_breakfast', availableActions: ['default_breakfast', 'rush_breakfast', 'detention_breakfast'] },
	{ id: 'class_1', label: '上午第一节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_chinese', availableActions: ['attend_class_chinese', 'task_progress', 'rest_short'] },
	{ id: 'class_2', label: '上午第二节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_math', availableActions: ['attend_class_math', 'task_progress', 'rest_short'] },
	{ id: 'big_break', label: '大课间', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress', 'rest_short'] },
	{ id: 'class_3', label: '上午第三节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_english', availableActions: ['attend_class_english', 'task_progress', 'rest_short'] },
	{ id: 'class_4', label: '上午第四节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_physics', availableActions: ['attend_class_physics', 'task_progress', 'rest_short'] },
	{ id: 'class_5', label: '上午第五节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_chemistry', availableActions: ['attend_class_chemistry', 'task_progress', 'rest_short'] },
	{ id: 'lunch', label: '午餐', category: 'routine', duration: 40, defaultAction: 'default_lunch', availableActions: ['default_lunch', 'rush_lunch', 'detention_lunch'] },
	{ id: 'noon_rest', label: '午休', category: 'rest', duration: MINUTES_PER_SLOT, defaultAction: 'take_nap', availableActions: ['take_nap', 'night_reading'] },
	{ id: 'class_6', label: '下午第一节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_biology', availableActions: ['attend_class_biology', 'task_progress', 'rest_short'] },
	{ id: 'class_7', label: '下午第二节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_history', availableActions: ['attend_class_history', 'task_progress', 'rest_short'] },
	{ id: 'class_8', label: '下午第三节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_geography', availableActions: ['attend_class_geography', 'task_progress', 'rest_short'] },
	{ id: 'class_9', label: '下午第四节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_political', availableActions: ['attend_class_political', 'task_progress', 'rest_short'] },
	{ id: 'class_10', label: '下午第五节课', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'attend_class_optional', availableActions: ['attend_class_optional', 'task_progress', 'rest_short'] },
	{ id: 'dinner', label: '晚餐', category: 'routine', duration: 40, defaultAction: 'default_dinner', availableActions: ['default_dinner', 'rush_dinner', 'detention_dinner'] },
	{ id: 'evening_news', label: '晚新闻', category: 'event', duration: MINUTES_PER_SLOT, defaultAction: 'watch_news', availableActions: ['watch_news', 'consult_teacher', 'self_study'] },
	{ id: 'self_study_1', label: '晚自习一', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'self_study_primary', availableActions: ['self_study_primary', 'task_progress', 'rest_short'] },
	{ id: 'self_study_2', label: '晚自习二', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'self_study_secondary', availableActions: ['self_study_secondary', 'task_progress', 'rest_short'] },
	{ id: 'self_study_3', label: '晚自习三', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'self_study_optional', availableActions: ['self_study_optional', 'task_progress', 'rest_short'] },
	{ id: 'evening_wash', label: '晚洗漱', category: 'routine', duration: 20, defaultAction: 'default_evening_wash', availableActions: ['default_evening_wash', 'detention_evening'] },
	{ id: 'night_rest', label: '晚休', category: 'rest', duration: 60, defaultAction: 'sleep', availableActions: ['sleep', 'night_reading'] },
];

const weeklyExamSlots: TimeSlotDefinition[] = [
	{ id: 'morning_wash', label: '早洗漱', category: 'routine', duration: 20, defaultAction: 'default_morning_wash', availableActions: ['default_morning_wash', 'lazy_sleep'] },
	{ id: 'morning_exercise', label: '早操', category: 'routine', duration: 20, defaultAction: 'default_morning_exercise', availableActions: ['default_morning_exercise'] },
	{ id: 'morning_reading', label: '自由活动', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress', 'rest_short'] },
	{ id: 'breakfast', label: '早餐', category: 'routine', duration: 20, defaultAction: 'default_breakfast', availableActions: ['default_breakfast', 'rush_breakfast'] },
	{ id: 'class_1', label: '语文周测', category: 'exam', duration: MINUTES_PER_SLOT, defaultAction: 'exam_chinese', availableActions: ['exam_chinese', 'exam_relax'] },
	{ id: 'class_2', label: '数学周测', category: 'exam', duration: MINUTES_PER_SLOT, defaultAction: 'exam_math', availableActions: ['exam_math', 'exam_relax'] },
	{ id: 'big_break', label: '自由活动', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress', 'rest_short'] },
	{ id: 'class_3', label: '英语周测', category: 'exam', duration: MINUTES_PER_SLOT, defaultAction: 'exam_english', availableActions: ['exam_english', 'exam_relax'] },
	{ id: 'class_4', label: '物理周测', category: 'exam', duration: MINUTES_PER_SLOT, defaultAction: 'exam_physics', availableActions: ['exam_physics', 'exam_relax'] },
	{ id: 'class_5', label: '化学周测', category: 'exam', duration: MINUTES_PER_SLOT, defaultAction: 'exam_chemistry', availableActions: ['exam_chemistry', 'exam_relax'] },
	{ id: 'lunch', label: '午餐', category: 'routine', duration: 40, defaultAction: 'default_lunch', availableActions: ['default_lunch', 'rush_lunch'] },
	{ id: 'noon_rest', label: '午休', category: 'rest', duration: MINUTES_PER_SLOT, defaultAction: 'take_nap', availableActions: ['take_nap', 'night_reading'] },
	{ id: 'class_6', label: '数学讲评', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'review_math', availableActions: ['review_math', 'task_progress'] },
	{ id: 'class_7', label: '英语讲评', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'review_english', availableActions: ['review_english', 'task_progress'] },
	{ id: 'class_8', label: '语文讲评', category: 'class', duration: MINUTES_PER_SLOT, defaultAction: 'review_chinese', availableActions: ['review_chinese', 'task_progress'] },
	{ id: 'class_9', label: '自选活动', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress', 'rest_short'] },
	{ id: 'class_10', label: '班会总结', category: 'event', duration: MINUTES_PER_SLOT, defaultAction: 'class_meeting', availableActions: ['class_meeting', 'task_progress'] },
	{ id: 'dinner', label: '晚餐', category: 'routine', duration: 40, defaultAction: 'default_dinner', availableActions: ['default_dinner', 'rush_dinner'] },
	{ id: 'evening_news', label: '自由时间', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'consult_teacher', 'self_study'] },
	{ id: 'self_study_1', label: '晚自习一', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'self_study_primary', availableActions: ['self_study_primary', 'task_progress', 'rest_short'] },
	{ id: 'self_study_2', label: '晚自习二', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'self_study_secondary', availableActions: ['self_study_secondary', 'task_progress', 'rest_short'] },
	{ id: 'self_study_3', label: '电影/自习', category: 'event', duration: MINUTES_PER_SLOT, defaultAction: 'movie_time', availableActions: ['movie_time', 'self_study_optional', 'task_progress'] },
	{ id: 'evening_wash', label: '晚洗漱', category: 'routine', duration: 20, defaultAction: 'default_evening_wash', availableActions: ['default_evening_wash'] },
	{ id: 'night_rest', label: '晚休', category: 'rest', duration: 60, defaultAction: 'sleep', availableActions: ['sleep', 'night_reading'] },
];

const holidaySlots: TimeSlotDefinition[] = [
	{ id: 'morning_wash', label: '假期早晨', category: 'break', duration: 60, defaultAction: 'sleep_in', availableActions: ['sleep_in', 'exercise', 'task_progress'] },
	{ id: 'morning_exercise', label: '早间活动', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'exercise', availableActions: ['exercise', 'task_progress', 'rest_short'] },
	{ id: 'morning_reading', label: '上午安排', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress', 'rest_short'] },
	{ id: 'breakfast', label: '早午餐', category: 'routine', duration: 40, defaultAction: 'holiday_breakfast', availableActions: ['holiday_breakfast', 'eat_out'] },
	{ id: 'class_1', label: '自由学习', category: 'self_study', duration: MINUTES_PER_SLOT, defaultAction: 'self_study_primary', availableActions: ['self_study_primary', 'task_progress', 'rest_short'] },
	{ id: 'class_2', label: '社交时间', category: 'social', duration: MINUTES_PER_SLOT, defaultAction: 'meet_friends', availableActions: ['meet_friends', 'homework', 'rest_short'] as any },
	{ id: 'big_break', label: '午饭', category: 'routine', duration: 40, defaultAction: 'holiday_lunch', availableActions: ['holiday_lunch', 'eat_out'] },
	{ id: 'class_3', label: '午间休息', category: 'rest', duration: MINUTES_PER_SLOT, defaultAction: 'take_nap', availableActions: ['take_nap', 'task_progress'] },
	{ id: 'class_4', label: '下午安排', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress', 'rest_short'] },
	{ id: 'class_5', label: '晚间社交', category: 'social', duration: MINUTES_PER_SLOT, defaultAction: 'family_time', availableActions: ['family_time', 'task_progress', 'rest_short'] as any },
	{ id: 'lunch', label: '晚餐', category: 'routine', duration: 60, defaultAction: 'holiday_dinner', availableActions: ['holiday_dinner', 'eat_out'] },
	{ id: 'noon_rest', label: '夜间休息', category: 'rest', duration: 120, defaultAction: 'sleep', availableActions: ['sleep', 'night_reading'] },
	{ id: 'class_6', label: '假日结束总结', category: 'event', duration: MINUTES_PER_SLOT, defaultAction: 'reflect_holiday', availableActions: ['reflect_holiday'] },
	{ id: 'class_7', label: '调整状态', category: 'event', duration: MINUTES_PER_SLOT, defaultAction: 'prepare_school', availableActions: ['prepare_school'] },
	{ id: 'class_8', label: '放松时间', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'rest_short', availableActions: ['rest_short', 'task_progress'] },
	{ id: 'class_9', label: '自由活动', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity', 'task_progress'] },
	{ id: 'class_10', label: '夜间安排', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'rest_short', availableActions: ['rest_short', 'task_progress'] },
	{ id: 'dinner', label: '宵夜', category: 'routine', duration: 30, defaultAction: 'holiday_snack', availableActions: ['holiday_snack'] },
	{ id: 'evening_news', label: '夜间总结', category: 'event', duration: MINUTES_PER_SLOT, defaultAction: 'journal_time', availableActions: ['journal_time'] },
	{ id: 'self_study_1', label: '睡前安排', category: 'rest', duration: MINUTES_PER_SLOT, defaultAction: 'sleep', availableActions: ['sleep', 'task_progress'] },
	{ id: 'self_study_2', label: '自由活动二', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity'] },
	{ id: 'self_study_3', label: '自由活动三', category: 'break', duration: MINUTES_PER_SLOT, defaultAction: 'free_activity', availableActions: ['free_activity'] },
	{ id: 'evening_wash', label: '准备休息', category: 'routine', duration: 20, defaultAction: 'default_evening_wash', availableActions: ['default_evening_wash'] },
	{ id: 'night_rest', label: '假日晚休', category: 'rest', duration: 120, defaultAction: 'sleep', availableActions: ['sleep'] },
];

const teachingDay: DayTemplate = {
	id: 'teaching-default',
	name: '普通教学日',
	kind: 'teaching',
	slots: teachingSlots,
};

const weeklyExamDay: DayTemplate = {
	id: 'weekly-exam',
	name: '周测日',
	kind: 'weekly_exam',
	slots: weeklyExamSlots,
};

const holidayDay: DayTemplate = {
	id: 'holiday',
	name: '假期日',
	kind: 'holiday',
	slots: holidaySlots,
};

export function createDefaultSchedule(): GameSchedule {
	return {
		templates: {
			[teachingDay.id]: teachingDay,
			[weeklyExamDay.id]: weeklyExamDay,
			[holidayDay.id]: holidayDay,
		},
		order: [
			teachingDay.id,
			teachingDay.id,
			teachingDay.id,
			teachingDay.id,
			teachingDay.id,
			weeklyExamDay.id,
			holidayDay.id,
		],
	};
}

export function getCurrentDayTemplate(schedule: GameSchedule, templateId: string): DayTemplate {
	return schedule.templates[templateId ?? schedule.order[0]] ?? teachingDay;
}

export function getTimeSlotDefinition(
	schedule: GameSchedule,
	templateId: string,
	timeIndex: number,
): TimeSlotDefinition {
	const template = getCurrentDayTemplate(schedule, templateId);
	if (!template.slots.length) {
		throw new Error(`Day template "${template.id}" 未配置任何时间段`);
	}
		const slot = template.slots[timeIndex];
		if (slot) return slot;
		const fallback = template.slots[template.slots.length - 1];
		if (!fallback) {
			throw new Error(`Day template "${template.id}" 缺少备用时间段`);
		}
		return fallback;
}

export interface AdvanceTimeResult {
	nextDayIndex: number;
	nextTimeSlotIndex: number;
	nextTemplateId: string;
	wrappedDay: boolean;
	wrappedWeek: boolean;
}

export function advanceTimeSlot(
	schedule: GameSchedule,
	currentDayIndex: number,
	currentTemplateId: string,
	currentTimeSlotIndex: number,
): AdvanceTimeResult {
	const template = getCurrentDayTemplate(schedule, currentTemplateId);
	const nextTimeSlotIndex = currentTimeSlotIndex + 1;

	if (nextTimeSlotIndex < template.slots.length) {
		return {
			nextDayIndex: currentDayIndex,
			nextTimeSlotIndex,
			nextTemplateId: currentTemplateId,
			wrappedDay: false,
			wrappedWeek: false,
		};
	}

	const dayOrderLength = schedule.order.length;
	const nextDayIndex = currentDayIndex + 1;
	const wrappedWeek = nextDayIndex >= dayOrderLength;
		const normalizedDayIndex = wrappedWeek ? 0 : nextDayIndex;
		const defaultTemplateId = schedule.order[0] ?? currentTemplateId;
		const nextTemplateId = schedule.order[normalizedDayIndex] ?? defaultTemplateId;

	return {
		nextDayIndex: normalizedDayIndex,
		nextTimeSlotIndex: 0,
		nextTemplateId,
		wrappedDay: true,
		wrappedWeek,
	};
}
