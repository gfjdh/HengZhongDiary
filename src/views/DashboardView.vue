<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';

const router = useRouter();
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
  availableActions,
  activeTasks,
  upcomingEvents,
  nextMajorEvent,
} = storeToRefs(gameStore);

const dayNumber = computed(() => currentDayIndex.value + 1);
const learningStateLabel = computed(() => learningStates.value?.[learningState.value]?.name ?? learningState.value);

const coreStats = computed(() => {
  const base = character.value;
  if (!base) return [];
  const values = [
    { key: 'energy', label: '精力', value: base.energy, max: 100 },
    { key: 'stress', label: '压力', value: base.stress, max: 100 },
    { key: 'learningMomentum', label: '学习劲头', value: base.learningMomentum, max: 100 },
  ];
  return values.map((stat) => ({
    ...stat,
    percent: Math.min(100, Math.max(0, Math.round((stat.value / stat.max) * 100))),
  }));
});

const highlightActions = computed(() => availableActions.value.slice(0, 3));

const urgentTasks = computed(() => [...activeTasks.value]
  .sort((a, b) => (a.priority === b.priority ? (a.deadline ?? Infinity) - (b.deadline ?? Infinity) : a.priority === 'required' ? -1 : 1))
  .slice(0, 3));

const upcomingHighlights = computed(() => upcomingEvents.value.slice(0, 3));

function goTo(path: string) {
  router.push(path);
}
</script>

<template>
  <section class="dashboard-grid">
    <article role="button" tabindex="0" class="summary-card status" @click="goTo('/status')" @keyup.enter="goTo('/status')">
      <header>
        <h2>状态概览</h2>
        <span class="state-tag">{{ learningStateLabel }}</span>
      </header>
      <p class="meta">第 {{ currentWeek }} 周 · 第 {{ dayNumber }} 日 · 时段 {{ currentTimeSlotIndex + 1 }}</p>
      <p class="sub-meta" v-if="currentDayTemplate">{{ currentDayTemplate.name }} · {{ currentTimeSlot?.label }}</p>
      <ul class="stat-strip">
        <li v-for="stat in coreStats" :key="stat.key">
          <span>{{ stat.label }}</span>
          <span>{{ Math.round(stat.value) }}</span>
          <div class="progress"><div class="inner" :style="{ width: `${stat.percent}%` }" /></div>
        </li>
      </ul>
      <footer>切换至详情查看全部属性与通知</footer>
    </article>

    <article role="button" tabindex="0" class="summary-card actions" @click="goTo('/actions')" @keyup.enter="goTo('/actions')">
      <header>
        <h2>行动建议</h2>
        <span class="count">{{ availableActions.length }}</span>
      </header>
      <p class="meta">当前时段可执行行动</p>
      <ul class="item-list">
        <li v-for="action in highlightActions" :key="action.id">
          <strong>{{ action.name }}</strong>
          <small>{{ action.category }}</small>
        </li>
        <li v-if="!highlightActions.length" class="placeholder">暂无可执行行动</li>
      </ul>
      <footer>查看详情以获取行动条件与效果说明</footer>
    </article>

    <article role="button" tabindex="0" class="summary-card time" @click="goTo('/time')" @keyup.enter="goTo('/time')">
      <header>
        <h2>时间线</h2>
        <span class="next">{{ nextMajorEvent ?? '暂无重点事件' }}</span>
      </header>
      <p class="meta">接下来</p>
      <ul class="item-list">
        <li v-for="event in upcomingHighlights" :key="event.id">
          <strong>{{ event.event.name }}</strong>
          <small>将在周 {{ event.triggerAt.week }} · 日 {{ event.triggerAt.dayIndex + 1 }} · 时段 {{ (event.triggerAt.timeSlotIndex ?? currentTimeSlotIndex) + 1 }}</small>
        </li>
        <li v-if="!upcomingHighlights.length" class="placeholder">暂无排队事件</li>
      </ul>
      <footer>前往详情可推进时间并查看全部事件</footer>
    </article>

    <article role="button" tabindex="0" class="summary-card tasks" @click="goTo('/tasks')" @keyup.enter="goTo('/tasks')">
      <header>
        <h2>任务进度</h2>
        <span class="count">{{ activeTasks.length }}</span>
      </header>
      <p class="meta">待办任务（{{ urgentTasks.length ? '优先级排序' : '暂无' }}）</p>
      <ul class="item-list">
        <li v-for="task in urgentTasks" :key="task.id">
          <strong>{{ task.name }}</strong>
          <small>
            {{ task.type === 'daily' ? '日常' : '限时' }} · {{ Math.round((task.progress / task.workload) * 100) }}%
            <template v-if="task.deadline !== undefined"> · 剩余 {{ task.deadline }} 天</template>
          </small>
        </li>
        <li v-if="!urgentTasks.length" class="placeholder">暂无待办任务</li>
      </ul>
      <footer>进入详情推进任务并查看完成记录</footer>
    </article>
  </section>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.25rem 1.4rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.summary-card:focus-visible {
  outline: 2px solid rgba(100, 108, 255, 0.6);
  outline-offset: 4px;
}

.summary-card:hover {
  transform: translateY(-2px);
  border-color: rgba(100, 108, 255, 0.25);
  background: rgba(100, 108, 255, 0.12);
}

.summary-card header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.summary-card h2 {
  margin: 0;
  font-size: 1.2rem;
}

.state-tag,
.count,
.next {
  font-size: 0.85rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.summary-card.actions .count,
.summary-card.tasks .count {
  background: rgba(59, 130, 246, 0.2);
  color: #bfdbfe;
}

.summary-card.time .next {
  background: rgba(16, 185, 129, 0.2);
  color: #bbf7d0;
}

.meta {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.sub-meta {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.65;
}

.stat-strip {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.6rem;
}

.stat-strip li {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem 0.7rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
}

.stat-strip span:first-child {
  font-size: 0.8rem;
  opacity: 0.7;
}

.stat-strip span:last-child {
  font-weight: 600;
}

.progress {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.progress .inner {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-list li {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
}

.item-list strong {
  font-size: 0.95rem;
}

.item-list small {
  font-size: 0.78rem;
  opacity: 0.72;
}

.placeholder {
  align-items: center;
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.65;
}

footer {
  margin-top: auto;
  font-size: 0.8rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
