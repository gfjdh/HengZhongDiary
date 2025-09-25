<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useGameStore } from './stores/gameStore';

const gameStore = useGameStore();
const { version } = storeToRefs(gameStore);
const route = useRoute();

const navItems = [
  { label: '概览', to: '/' },
  { label: '状态', to: '/status' },
  { label: '行动', to: '/actions' },
  { label: '时间', to: '/time' },
  { label: '任务', to: '/tasks' },
];

const activePath = computed(() => route.path);

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

    <nav class="app-nav" aria-label="主导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: activePath === item.to }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 1.5rem 2rem 2.5rem;
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

.app-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.95rem;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  border-color: rgba(100, 108, 255, 0.45);
  background: rgba(100, 108, 255, 0.18);
  color: #cbd5ff;
}

.app-main {
  flex: 1 1 auto;
}

@media (max-width: 1024px) {
  .app-shell {
    padding: 1rem;
  }

  .app-nav {
    gap: 0.5rem;
  }
}
</style>
