<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import type { GameTask } from '../../types/game';
import { useGameStore } from '../../stores/gameStore';

const gameStore = useGameStore();
const { availableActions, activeTasks } = storeToRefs(gameStore);

const taskSelection = reactive<Record<string, string | null>>({});

const actionEntries = computed(() => availableActions.value.map((action) => {
  const result = gameStore.canPerformAction(action);
  return {
    action,
    disabled: !result.ok,
    reasons: result.reasons,
    isTaskAction: Boolean(action.taskProgress),
  };
}));

watch(
  [availableActions, activeTasks],
  () => {
    actionEntries.value.forEach(({ action, isTaskAction }) => {
      if (!isTaskAction) return;
      if (!taskSelection[action.id]) {
        taskSelection[action.id] = activeTasks.value[0]?.id ?? null;
      } else if (!activeTasks.value.some((task) => task.id === taskSelection[action.id])) {
        taskSelection[action.id] = activeTasks.value[0]?.id ?? null;
      }
    });
  },
  { immediate: true },
);

function performAction(actionId: string) {
  const entry = actionEntries.value.find(({ action }) => action.id === actionId);
  if (!entry) return;

  const payload: { taskId?: string } = {};
  if (entry.isTaskAction) {
    const selected = taskSelection[actionId];
    if (selected) {
      payload.taskId = selected;
    }
  }

  gameStore.performAction(actionId, payload);
}

function formatTask(task: GameTask): string {
  const base = `${task.name}`;
  const typeLabel = task.type === 'daily' ? '日常' : '限时';
  const workload = Math.round((task.progress / task.workload) * 100);
  return `${base}（${typeLabel} · ${workload}%）`;
}
</script>

<template>
  <article class="panel">
    <header class="panel-header">
      <h3>时间段可选行动</h3>
      <p class="meta">根据当前时段列出可执行的行动与其影响</p>
    </header>

    <p v-if="!actionEntries.length" class="empty">当前时段没有可执行的行动，尝试推进时间。</p>

    <ul v-else class="action-list">
      <li v-for="entry in actionEntries" :key="entry.action.id" class="action-card" :class="[`category-${entry.action.category}`]">
        <div class="action-main">
          <div class="action-title">
            <span class="name">{{ entry.action.name }}</span>
            <span class="category">{{ entry.action.category }}</span>
          </div>
          <p class="description">{{ entry.action.description }}</p>

          <div v-if="entry.isTaskAction" class="task-selector">
            <label>
              关联任务
              <select v-model="taskSelection[entry.action.id]">
                <option v-for="task in activeTasks" :key="task.id" :value="task.id">
                  {{ formatTask(task) }}
                </option>
                <option v-if="!activeTasks.length" disabled value="">
                  暂无待办任务
                </option>
              </select>
            </label>
          </div>

          <div v-if="entry.reasons.length" class="requirements" :aria-live="entry.disabled ? 'polite' : 'off'">
            <strong>未满足条件：</strong>
            <ul>
              <li v-for="reason in entry.reasons" :key="reason">{{ reason }}</li>
            </ul>
          </div>
        </div>

        <footer class="action-footer">
          <small class="effects">影响条目：{{ entry.action.effects.length }}</small>
          <button
            type="button"
            class="primary-button"
            :disabled="entry.disabled || (entry.isTaskAction && !taskSelection[entry.action.id])"
            @click="performAction(entry.action.id)"
          >
            执行
          </button>
        </footer>
      </li>
    </ul>
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
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
  opacity: 0.75;
}

.empty {
  margin: 0;
  opacity: 0.75;
  font-size: 0.9rem;
}

.action-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 1rem;
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
}

.action-card.category-rest {
  border-color: rgba(114, 226, 174, 0.25);
}

.action-card.category-study {
  border-color: rgba(100, 108, 255, 0.25);
}

.action-card.category-task {
  border-color: rgba(255, 200, 87, 0.25);
}

.action-main {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
}

.name {
  font-weight: 600;
  font-size: 1.05rem;
}

.category {
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
}

.description {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.task-selector select {
  margin-top: 0.45rem;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: inherit;
}

.requirements {
  font-size: 0.85rem;
  color: #ffb974;
}

.requirements ul {
  margin: 0.35rem 0 0;
  padding-left: 1.1rem;
}

.action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.effects {
  opacity: 0.65;
  font-size: 0.8rem;
}

.primary-button {
  border-radius: 999px;
  padding: 0.45rem 1.1rem;
  background: linear-gradient(90deg, #646cff, #5b87ff);
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-button:not(:disabled):hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .panel {
    padding: 1.1rem;
  }
}
</style>
