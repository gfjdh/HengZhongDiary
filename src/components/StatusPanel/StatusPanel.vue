<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { LearningState } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';

const gameStore = useGameStore();
const {
  currentWeek,
  currentDayIndex,
  currentTimeSlotIndex,
  currentDayTemplate,
  currentTimeSlot,
  learningState,
  learningStates,
  character,
  notifications,
} = storeToRefs(gameStore);

const dayNumber = computed(() => currentDayIndex.value + 1);

const dynamicStats = computed(() => {
  const base = character.value;
  if (!base) return [];
  const stats = [
    { key: 'energy', label: '精力', value: base.energy, min: 0, max: 100 },
    { key: 'mood', label: '心情', value: base.mood, min: -100, max: 100 },
    { key: 'stress', label: '压力', value: base.stress, min: 0, max: 100 },
    { key: 'learningMotivation', label: '学习动力', value: base.learningMotivation, min: 0, max: 100 },
    { key: 'learningMomentum', label: '学习劲头', value: base.learningMomentum, min: 0, max: 100 },
    { key: 'mentalHealth', label: '心理素质', value: base.mentalHealth, min: 0, max: 100 },
    { key: 'physicalHealth', label: '身体健康', value: base.physicalHealth, min: 0, max: 100 },
  ];
  return stats.map((item) => {
    const { value, min, max } = item;
    const percent = ((value - min) / (max - min)) * 100;
    return {
      ...item,
      display: Math.round(value),
      percent: Math.min(100, Math.max(0, Math.round(percent))),
    };
  });
});

const knowledgeSummary = computed(() => {
  const knowledge = character.value?.knowledge ?? {};
  return Object.entries(knowledge)
    .map(([subject, value]) => ({ subject, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
});

const skillSummary = computed(() => {
  const skills = character.value?.skills ?? {};
  return Object.entries(skills)
    .map(([subject, value]) => ({ subject, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
});

const stateOptions = computed(() => Object.values(learningStates.value ?? {}).map((config) => {
  const result = gameStore.canSwitchLearningState(config.id);
  return {
    config,
    disabled: !result.ok && config.id !== learningState.value,
    reasons: result.reasons,
  };
}));

const recentNotifications = computed(() => notifications.value.slice(0, 5));

function switchState(target: LearningState) {
  if (target === learningState.value) return;
  gameStore.switchLearningState(target);
}

function dismissNotification(id: string) {
  gameStore.removeNotification(id);
}

function clearNotifications() {
  if (!notifications.value.length) return;
  gameStore.clearNotifications();
}
</script>

<template>
  <article class="panel">
    <header class="panel-header">
      <div>
        <h3>状态总览</h3>
        <p class="meta">第 {{ currentWeek }} 周 · 第 {{ dayNumber }} 日 · 时段 {{ currentTimeSlotIndex + 1 }}</p>
      </div>
      <div class="time-tags" v-if="currentDayTemplate">
        <span class="tag">{{ currentDayTemplate.name }}</span>
        <span class="tag secondary" v-if="currentTimeSlot">{{ currentTimeSlot.label }}</span>
      </div>
    </header>

    <section class="learning-state" aria-label="学习状态">
      <h4>学习状态</h4>
      <div class="state-buttons">
        <button
          v-for="option in stateOptions"
          :key="option.config.id"
          type="button"
          class="state-button"
          :class="{ active: option.config.id === learningState, disabled: option.disabled }"
          :disabled="option.disabled"
          @click="switchState(option.config.id)"
        >
          <span>{{ option.config.name }}</span>
          <small>{{ option.config.description }}</small>
          <ul v-if="option.disabled && option.reasons.length" class="hint">
            <li v-for="reason in option.reasons" :key="reason">{{ reason }}</li>
          </ul>
        </button>
      </div>
    </section>

    <section class="stat-grid" aria-label="角色状态">
      <div v-for="stat in dynamicStats" :key="stat.key" class="stat-card">
        <div class="stat-top">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.display }}</span>
        </div>
        <div class="progress" role="progressbar" :aria-valuenow="stat.display" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-inner" :style="{ width: `${stat.percent}%` }" />
        </div>
      </div>
    </section>

    <section class="academics" aria-label="学科表现">
      <div class="academics-column">
        <h4>知识积累 TOP3</h4>
        <ul>
          <li v-for="item in knowledgeSummary" :key="item.subject">
            <span class="subject">{{ item.subject }}</span>
            <span class="value">{{ Math.round(item.value) }}</span>
          </li>
        </ul>
      </div>
      <div class="academics-column">
        <h4>做题技巧 TOP3</h4>
        <ul>
          <li v-for="item in skillSummary" :key="item.subject">
            <span class="subject">{{ item.subject }}</span>
            <span class="value">{{ Math.round(item.value) }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="notifications" aria-label="系统提示">
      <div class="notifications-header">
        <h4>最近提示</h4>
        <button type="button" class="link-button" @click="clearNotifications">全部清除</button>
      </div>
      <p v-if="!recentNotifications.length" class="empty">暂无新的通知。</p>
      <ul v-else>
        <li v-for="notification in recentNotifications" :key="notification.id" :class="['notice', notification.level]">
          <div>
            <strong>{{ notification.message }}</strong>
            <small>{{ new Date(notification.timestamp).toLocaleString() }}</small>
          </div>
          <button type="button" class="link-button" @click="dismissNotification(notification.id)">忽略</button>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--panel-background, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--panel-border, rgba(255, 255, 255, 0.12));
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.4rem;
}

.panel-header .meta {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

.time-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(100, 108, 255, 0.15);
  color: #a5adff;
}

.tag.secondary {
  background: rgba(114, 226, 174, 0.18);
  color: #7ff0c0;
}

.learning-state h4,
.academics h4,
.notifications h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.state-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.state-button {
  text-align: left;
  border-radius: 0.9rem;
  padding: 0.75rem 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.state-button small {
  opacity: 0.75;
  font-size: 0.75rem;
}

.state-button .hint {
  margin: 0.35rem 0 0;
  padding-left: 1rem;
  font-size: 0.72rem;
  opacity: 0.6;
}

.state-button.active {
  border-color: rgba(100, 108, 255, 0.6);
  background: rgba(100, 108, 255, 0.15);
}

.state-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
}

.stat-card {
  border-radius: 0.85rem;
  padding: 0.65rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-label {
  opacity: 0.75;
}

.stat-value {
  font-weight: 600;
}

.progress {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #646cff, #9f78ff);
}

.academics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.academics-column ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.academics-column li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.03);
}

.subject {
  text-transform: capitalize;
  opacity: 0.75;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-button {
  background: none;
  border: none;
  color: #8fa6ff;
  padding: 0;
  font-size: 0.85rem;
  cursor: pointer;
}

.link-button:hover {
  text-decoration: underline;
}

.empty {
  margin: 0;
  opacity: 0.7;
  font-size: 0.85rem;
}

.notifications ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.notice {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
}

.notice.success {
  background: rgba(114, 226, 174, 0.12);
}

.notice.warning {
  background: rgba(255, 200, 87, 0.12);
}

.notice.danger {
  background: rgba(255, 99, 132, 0.12);
}

.notice small {
  display: block;
  opacity: 0.65;
  margin-top: 0.35rem;
}

@media (max-width: 768px) {
  .panel {
    padding: 1.1rem;
  }

  .state-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
