import type { AttributeModifier, CharacterAttributes, TemporaryEffect } from '../../types/game';

interface ApplyModifierOptions {
	clampToModel?: boolean;
}

const DEFAULT_CLAMP: Record<string, { min?: number; max?: number }> = {
	energy: { min: 0, max: 100 },
	mood: { min: -100, max: 100 },
	mentalHealth: { min: 0, max: 100 },
	learningMotivation: { min: 0, max: 100 },
	learningMomentum: { min: 0, max: 100 },
	physicalHealth: { min: 0, max: 100 },
	stress: { min: 0, max: 100 },
};

function cloneAttributes(source: CharacterAttributes): CharacterAttributes {
	return structuredClone ? structuredClone(source) : JSON.parse(JSON.stringify(source));
}

function clampValue(value: number, clamp?: { min?: number; max?: number }) {
	if (!clamp) return value;
	let result = value;
	if (typeof clamp.min === 'number') {
		result = Math.max(result, clamp.min);
	}
	if (typeof clamp.max === 'number') {
		result = Math.min(result, clamp.max);
	}
	return result;
}

function resolvePath(target: CharacterAttributes, path: string) {
	const segments = path.split('.');
	let context: Record<string, any> | undefined = target as Record<string, any>;
	for (let i = 0; i < segments.length - 1; i += 1) {
		if (!context) return { container: undefined, key: undefined };
			const currentContext = context as Record<string, any>;
			const keySegment = segments[i];
			if (typeof keySegment === 'undefined') {
				return { container: undefined, key: undefined };
			}
			const next = currentContext[keySegment];
		if (next == null || typeof next !== 'object') {
			return { container: undefined, key: undefined };
		}
		context = next as Record<string, any>;
	}
	return {
		container: context,
		key: segments[segments.length - 1],
	};
}

export function applyAttributeModifiers(
	source: CharacterAttributes,
	modifiers: AttributeModifier[],
	options: ApplyModifierOptions = {},
): CharacterAttributes {
	if (!modifiers.length) return source;

	const cloned = cloneAttributes(source);

	modifiers.forEach((modifier) => {
		const path = typeof modifier.target === 'string' ? modifier.target : String(modifier.target);
		const { container, key } = resolvePath(cloned, path);
		if (!container || !key) return;

		const typedContainer = container as Record<string, any>;
		const existing = typedContainer[key];
		const current = typeof existing === 'number' ? existing : 0;
		let next = current;

		if (modifier.type === 'add') {
			next = current + modifier.value;
		} else {
			next = current * modifier.value;
		}

				const clampRule = modifier.clamp
					|| (options.clampToModel ? DEFAULT_CLAMP[path] ?? DEFAULT_CLAMP[key] : undefined);

				typedContainer[key] = clampValue(next, clampRule);
	});

	return cloned;
}

export function reduceTemporaryEffects(effects: TemporaryEffect[]): TemporaryEffect[] {
	return effects
		.map((effect) => ({ ...effect, duration: effect.duration - 1 }))
		.filter((effect) => effect.duration > 0);
}

export function aggregateTemporaryModifiers(effects: TemporaryEffect[]): AttributeModifier[] {
	return effects.flatMap((effect) => effect.modifiers);
}

export function applyTemporaryEffects(
	source: CharacterAttributes,
	effects: TemporaryEffect[],
): CharacterAttributes {
	if (!effects.length) return source;
	const modifiers = aggregateTemporaryModifiers(effects);
	return applyAttributeModifiers(source, modifiers, { clampToModel: true });
}
