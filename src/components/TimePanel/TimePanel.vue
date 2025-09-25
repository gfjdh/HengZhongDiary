<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '../../stores/gameStore';

const gameStore = useGameStore();
const {
  currentWeek,
  currentDayIndex,
  currentTimeSlotIndex,
  currentDayTemplate,
  currentTimeSlot,
  upcomingEvents,
  nextMajorEvent,
} = storeToRefs(gameStore);

const slots = computed(() => currentDayTemplate.value?.slots ?? []);
const progress = computed(() => {
  if (!slots.value.length) return 0;
  return Math.round(((currentTimeSlotIndex.value + 1) / slots.value.length) * 100);
});

const upcomingForToday = computed(() => upcomingEvents.value
  .filter((item) => item.triggerAt.dayIndex === currentDayIndex.value)
  .slice(0, 3));

function advance() {
  gameStore.advanceTime();
}

function formatSlotCategory(category?: string) {
  if (!category) return '常规';
  const map: Record<string, string> = {
    routine: '日常',
    class: '课堂',
    self_study: '自习',
    break: '休息',
    exam: '考试',
    event: '事件',
    rest: '休整',
    social: '社交',
    task: '任务',
  };
  return map[category] ?? category;
}
</script>

<template>
  <article class="panel">
    <header class="panel-header">
      <div>
        <h3>时间轴</h3>
        <p class="meta">第 {{ currentWeek }} 周 · 第 {{ currentDayIndex + 1 }} 日 · 完成 {{ progress }}%</p>
      </div>
      <button type="button" class="primary-button" @click="advance">推进时段</button>
    </header>

    <section class="current-slot" v-if="currentTimeSlot">
      <div class="slot-label">
        <span class="name">{{ currentTimeSlot.label }}</span>
        <span class="category">{{ formatSlotCategory(currentTimeSlot.category) }}</span>
      </div>
      <p class="summary">默认：{{ currentTimeSlot.defaultAction }}</p>
    </section>

    <section class="timeline" aria-label="教学日时间轴">
      <ol>
        <li
          v-for="(slot, index) in slots"
          :key="slot.id + index"
          :class="['timeline-item', { current: index === currentTimeSlotIndex }]"
        >
          <div class="badge">{{ index + 1 }}</div>
          <div class="details">
            <div class="title">{{ slot.label }}</div>
            <div class="subtitle">{{ formatSlotCategory(slot.category) }}</div>
          </div>
        </li>
      </ol>
    </section>

    <section class="upcoming">
      <h4>即将到来的事件</h4>
      <p v-if="!upcomingForToday.length" class="empty">今日暂未安排额外事件。</p>
      <ul v-else>
        <li v-for="item in upcomingForToday" :key="item.id">
          <strong>{{ item.event.name }}</strong>
          <small>触发时段：第 {{ (item.triggerAt.timeSlotIndex ?? 0) + 1 }} 段</small>
        </li>
      </ul>
      <p v-if="nextMajorEvent" class="next-major">下一次重点事件：{{ nextMajorEvent }}</p>
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
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.meta {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.primary-button {
  border-radius: 999px;
  padding: 0.45rem 1.2rem;
  background: linear-gradient(90deg, #72e2ae, #4fc3f7);
  border: none;
  color: #04121d;
  font-weight: 600;
  cursor: pointer;
}

.current-slot {
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
}

.slot-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.slot-label .name {
  font-weight: 600;
}

.slot-label .category {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.summary {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.timeline {
  max-height: 260px;
  overflow: auto;
  padding-right: 0.25rem;
}

.timeline ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.4rem 0.6rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
}

.timeline-item.current {
  border: 1px solid rgba(100, 108, 255, 0.4);
  background: rgba(100, 108, 255, 0.12);
}

.badge {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
}

.details .title {
  font-size: 0.95rem;
}

.details .subtitle {
  font-size: 0.75rem;
  opacity: 0.6;
}

.upcoming {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.upcoming ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upcoming li {
  padding: 0.55rem 0.7rem;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
}

.upcoming li small {
  display: block;
  opacity: 0.65;
  margin-top: 0.25rem;
}

.empty {
  margin: 0;
  opacity: 0.7;
  font-size: 0.85rem;
}

.next-major {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

@media (max-width: 768px) {
  .panel {
    padding: 1.1rem;
  }
}
</style>
