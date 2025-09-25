<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { GameTask } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';

const gameStore = useGameStore();
const { activeTasks, completedTasks, availableActions } = storeToRefs(gameStore);

const sortedActiveTasks = computed(() => [...activeTasks.value].sort((a, b) => {
  if (a.priority === b.priority) {
    const aDeadline = a.deadline ?? Number.POSITIVE_INFINITY;
    const bDeadline = b.deadline ?? Number.POSITIVE_INFINITY;
    return aDeadline - bDeadline;
  }
  return a.priority === 'required' ? -1 : 1;
}));

const recentCompleted = computed(() => completedTasks.value.slice(-3).reverse());

const canProgressTasks = computed(() => availableActions.value.some((action) => action.id === 'task_progress'));

function progressPercent(task: GameTask) {
  if (!task.workload) return 0;
  return Math.round((task.progress / task.workload) * 100);
}

function deadlineLabel(task: GameTask) {
  if (task.type !== 'timed') return '今日必做';
  if (typeof task.deadline !== 'number') return '限时任务';
  if (task.deadline <= 0) return '已到期';
  return `还剩 ${task.deadline} 天`;
}

function runTask(task: GameTask) {
  if (!canProgressTasks.value) {
    gameStore.addNotification('当前时段无法推进任务，请等待合适的时间段。', 'warning');
    return;
  }
  gameStore.performAction('task_progress', { taskId: task.id });
}
</script>

<template>
  <article class="panel">
    <header class="panel-header">
      <h3>学习任务</h3>
      <p class="meta">追踪日常与限时任务的进度，保持节奏</p>
    </header>

    <section class="task-list" aria-label="待办任务">
      <h4>待处理</h4>
      <p v-if="!sortedActiveTasks.length" class="empty">近期没有待办任务。</p>
      <ul v-else>
        <li v-for="task in sortedActiveTasks" :key="task.id" class="task-card" :class="[`priority-${task.priority}`]">
          <div class="task-header">
            <div>
              <span class="name">{{ task.name }}</span>
              <span class="type">{{ task.type === 'daily' ? '日常任务' : '限时任务' }}</span>
            </div>
            <span class="deadline">{{ deadlineLabel(task) }}</span>
          </div>
          <div class="task-body">
            <div class="progress" role="progressbar" :aria-valuenow="progressPercent(task)" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-inner" :style="{ width: `${progressPercent(task)}%` }" />
            </div>
            <div class="task-footer">
              <span class="workload">{{ task.progress }}/{{ task.workload }}</span>
              <button type="button" class="secondary-button" :disabled="!canProgressTasks" @click="runTask(task)">
                推进任务
              </button>
            </div>
          </div>
        </li>
      </ul>
      <p v-if="!canProgressTasks && sortedActiveTasks.length" class="hint">当前时段不能推进任务，尝试选择其他行动或推进时间。</p>
    </section>

    <section class="task-completed" aria-label="近期完成">
      <h4>近期完成</h4>
      <p v-if="!recentCompleted.length" class="empty">暂未完成任务。</p>
      <ul v-else>
        <li v-for="task in recentCompleted" :key="task.id">
          <span class="name">{{ task.name }}</span>
          <small>{{ task.type === 'daily' ? '日常' : '限时' }} · 完成度 {{ progressPercent(task) }}%</small>
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

.panel-header h3 {
  margin: 0;
  font-size: 1.35rem;
}

.meta {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.empty {
  margin: 0;
  opacity: 0.75;
  font-size: 0.9rem;
}

.task-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.task-card {
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.task-card.priority-required {
  border: 1px solid rgba(255, 153, 102, 0.35);
}

.task-card.priority-optional {
  border: 1px solid rgba(114, 226, 174, 0.25);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.name {
  font-weight: 600;
}

.type {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.deadline {
  font-size: 0.8rem;
  opacity: 0.7;
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.progress {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #ff9966, #ff5e62);
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workload {
  font-size: 0.8rem;
  opacity: 0.7;
}

.secondary-button {
  border-radius: 999px;
  padding: 0.4rem 1rem;
  background: rgba(100, 108, 255, 0.15);
  border: 1px solid rgba(100, 108, 255, 0.35);
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button:not(:disabled):hover {
  background: rgba(100, 108, 255, 0.25);
}

.hint {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: #ffb974;
}

.task-completed ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.task-completed li {
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0.6rem;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
}

.task-completed small {
  opacity: 0.65;
}

@media (max-width: 768px) {
  .panel {
    padding: 1.1rem;
  }
}
</style>
