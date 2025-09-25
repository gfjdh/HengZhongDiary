import type {
	AttributeModifier,
	EventEffect,
	EventTriggerCondition,
	GameEvent,
	GameNotification,
	GameState,
	PendingEvent,
} from '../../types/game';
import { applyAttributeModifiers } from '../attribute/AttributeSystem';

export interface EventResolutionOutcome {
	characterModifiers: AttributeModifier[];
	teacherDelta: Record<string, number>;
	classmateDelta: Record<string, number>;
	notifications: GameNotification[];
	scheduledEvents: PendingEvent[];
}

export function isConditionMet(state: GameState, condition: EventTriggerCondition): boolean {
	const { type } = condition;
	switch (type) {
		case 'time': {
			const payload = condition.condition as {
				week?: number | number[];
				dayIndex?: number | number[];
				timeSlotIndex?: number | number[];
				dayKind?: string | string[];
			};
			if (payload.week !== undefined) {
				const expectedWeeks = Array.isArray(payload.week) ? payload.week : [payload.week];
				if (!expectedWeeks.includes(state.currentWeek)) return false;
			}
			if (payload.dayIndex !== undefined) {
				const expectedDays = Array.isArray(payload.dayIndex) ? payload.dayIndex : [payload.dayIndex];
				if (!expectedDays.includes(state.currentDayIndex)) return false;
			}
			if (payload.timeSlotIndex !== undefined) {
				const expectedTimes = Array.isArray(payload.timeSlotIndex)
					? payload.timeSlotIndex
					: [payload.timeSlotIndex];
				if (!expectedTimes.includes(state.currentTimeSlotIndex)) return false;
			}
			if (payload.dayKind !== undefined) {
				const expectedKinds = Array.isArray(payload.dayKind) ? payload.dayKind : [payload.dayKind];
				const template = state.schedule.templates[state.currentDayTemplateId];
				if (!template || !expectedKinds.includes(template.kind)) return false;
			}
			return true;
		}
		case 'attribute': {
			const { target, comparator = 'gte', value } = condition.condition as {
				target: string;
				comparator?: 'gte' | 'lte' | 'eq' | 'ne' | 'gt' | 'lt';
				value: number;
			};
			const attributeValue = getNestedNumber(state.character, target);
			if (attributeValue === undefined) return false;
			return compare(attributeValue, comparator, value);
		}
		case 'relationship': {
			const { scope, id, comparator = 'gte', value } = condition.condition as {
				scope: 'teacher' | 'classmate';
				id: string;
				comparator?: 'gte' | 'lte' | 'eq' | 'ne' | 'gt' | 'lt';
				value: number;
			};
			const container = scope === 'teacher' ? state.teacherRelations : state.classmateRelations;
			const relationValue = container[id] ?? 0;
			return compare(relationValue, comparator, value);
		}
		case 'previousEvent': {
			const { eventId } = condition.condition as { eventId: string };
			return state.eventHistory.some((event) => event.id === eventId);
		}
		default:
			return false;
	}
}

export function isEventEligible(state: GameState, event: GameEvent): boolean {
	if (!event.triggerConditions?.length) return true;
	return event.triggerConditions.every((condition) => isConditionMet(state, condition));
}

function compare(value: number, comparator: string, expected: number): boolean {
	switch (comparator) {
		case 'gte':
			return value >= expected;
		case 'lte':
			return value <= expected;
		case 'gt':
			return value > expected;
		case 'lt':
			return value < expected;
		case 'ne':
			return value !== expected;
		case 'eq':
		default:
			return value === expected;
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

export function pickWeightedEvent(events: GameEvent[]): GameEvent | undefined {
	if (!events.length) return undefined;
	const totalWeight = events.reduce((sum, event) => sum + (event.weight ?? 1), 0);
	let roll = Math.random() * totalWeight;
	for (const event of events) {
		const weight = event.weight ?? 1;
		if (roll < weight) return event;
		roll -= weight;
	}
	return events[events.length - 1];
}

export function evaluateEvents(state: GameState, pool: GameEvent[]): GameEvent | undefined {
	const eligible = pool.filter((event) => isEventEligible(state, event));
	return pickWeightedEvent(eligible);
}

export function resolveEventEffects(
	effects: EventEffect[],
): EventResolutionOutcome {
	const characterModifiers: AttributeModifier[] = [];
	const teacherDelta: Record<string, number> = {};
	const classmateDelta: Record<string, number> = {};
	const notifications: GameNotification[] = [];
	const scheduledEvents: PendingEvent[] = [];

	effects.forEach((effect) => {
		switch (effect.type) {
					case 'attribute': {
						const value = effect.value;
						if (Array.isArray(value)) {
							characterModifiers.push(
								...(value as AttributeModifier[]).map((modifier) => ({ ...modifier })),
							);
						} else if (value) {
							characterModifiers.push({ ...(value as AttributeModifier) });
						}
				break;
			}
			case 'relationship': {
				const { target, value } = effect;
				if (typeof value !== 'number') break;
				if (target.startsWith('teacher:')) {
					const id = target.replace('teacher:', '');
					teacherDelta[id] = (teacherDelta[id] ?? 0) + value;
				} else if (target.startsWith('classmate:')) {
					const id = target.replace('classmate:', '');
					classmateDelta[id] = (classmateDelta[id] ?? 0) + value;
				}
				break;
			}
			case 'unlock': {
						const pending = effect.value as PendingEvent | PendingEvent[] | undefined;
				if (!pending) break;
				if (Array.isArray(pending)) {
							scheduledEvents.push(...pending.map((item) => ({ ...item, event: { ...item.event } })));
				} else {
							scheduledEvents.push({ ...pending, event: { ...pending.event } });
				}
				break;
			}
			case 'trigger': {
				notifications.push({
					id: `event-trigger-${effect.target}-${Date.now()}`,
					timestamp: new Date().toISOString(),
					message: String(effect.value ?? effect.target),
					level: 'info',
				});
				break;
			}
			default:
				break;
		}
	});

	return {
		characterModifiers,
		teacherDelta,
		classmateDelta,
		notifications,
		scheduledEvents,
	};
}

export function applyEventOutcome(
	state: GameState,
	outcome: EventResolutionOutcome,
): {
	character: GameState['character'];
	teacherRelations: GameState['teacherRelations'];
	classmateRelations: GameState['classmateRelations'];
	notifications: GameNotification[];
	scheduledEvents: PendingEvent[];
} {
	const updatedCharacter = outcome.characterModifiers.length
		? applyAttributeModifiers(state.character, outcome.characterModifiers, { clampToModel: true })
		: state.character;

	const teacherRelations = { ...state.teacherRelations };
	Object.entries(outcome.teacherDelta).forEach(([id, delta]) => {
		teacherRelations[id] = (teacherRelations[id] ?? 0) + delta;
	});

	const classmateRelations = { ...state.classmateRelations };
	Object.entries(outcome.classmateDelta).forEach(([id, delta]) => {
		classmateRelations[id] = (classmateRelations[id] ?? 0) + delta;
	});

	return {
		character: updatedCharacter,
		teacherRelations,
		classmateRelations,
		notifications: outcome.notifications,
		scheduledEvents: outcome.scheduledEvents,
	};
}
