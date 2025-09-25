<script setup lang="ts">
import { storeToRefs } from 'pinia';
import StatusPanel from './components/StatusPanel/StatusPanel.vue';
import ActionPanel from './components/ActionPanel/ActionPanel.vue';
import TimePanel from './components/TimePanel/TimePanel.vue';
import TaskPanel from './components/TaskPanel/TaskPanel.vue';
import { useGameStore } from './stores/gameStore';

const gameStore = useGameStore();
const { version } = storeToRefs(gameStore);

function handleReset() {
  if (window.confirm('确认要重置当前进度吗？')) {
    gameStore.reset();
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>衡中日记</h1>
        <p class="subtitle">高三备战日程管理原型界面</p>
      </div>
      <div class="header-actions">
        <span class="version">版本 {{ version }}</span>
        <button type="button" class="ghost-button" @click="handleReset">重新开始</button>
      </div>
    </header>

    <main class="app-main">
      <section class="column column-left">
        <StatusPanel />
        <TimePanel />
      </section>
      <section class="column column-right">
        <ActionPanel />
        <TaskPanel />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  padding: 1.5rem 2rem 2rem;
  box-sizing: border-box;
  gap: 1.5rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  border-bottom: 1px solid var(--panel-border, rgba(255, 255, 255, 0.12));
  padding-bottom: 1rem;
}

.title-block h1 {
  margin: 0;
  font-size: 2.4rem;
  letter-spacing: 0.04em;
}

.subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  opacity: 0.75;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.version {
  font-size: 0.95rem;
  opacity: 0.75;
}

.ghost-button {
  border-radius: 999px;
  background: transparent;
  border: 1px solid currentColor;
  padding: 0.45rem 1.1rem;
  font-size: 0.95rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.ghost-button:hover {
  background-color: rgba(100, 108, 255, 0.1);
  color: #646cff;
}

.app-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: flex-start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .app-shell {
    padding: 1rem;
  }

  .app-main {
    grid-template-columns: 1fr;
  }
}
</style>
