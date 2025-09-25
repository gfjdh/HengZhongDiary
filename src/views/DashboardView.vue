<!-- DashboardView.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
//import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import type { LearningState } from '../types/game';

//const router = useRouter();
const gameStore = useGameStore();
const {
  currentWeek,
  currentDayIndex,
  currentTimeSlotIndex,
  currentDayTemplate,
  //currentTimeSlot,
  learningState,
  learningStates,
  character,
  availableActions,
  activeTasks,
  //upcomingEvents,
  nextMajorEvent,
} = storeToRefs(gameStore);

const dayNumber = computed(() => currentDayIndex.value + 1);
const learningStateLabel = computed(() => learningStates.value?.[learningState.value]?.name ?? learningState.value);

// 紧凑版角色状态
const compactStats = computed(() => {
  const base = character.value;
  if (!base) return [];
  return [
    { key: 'energy', label: '精力', value: base.energy, max: 100 },
    { key: 'stress', label: '压力', value: base.stress, max: 100 },
    { key: 'mood', label: '心情', value: base.mood, min: -100, max: 100 },
    { key: 'learningMomentum', label: '劲头', value: base.learningMomentum, max: 100 },
    { key: 'mentalHealth', label: '心理', value: base.mentalHealth, max: 100 },
    { key: 'physicalHealth', label: '健康', value: base.physicalHealth, max: 100 },
  ].map(stat => ({
    ...stat,
    percent: Math.min(100, Math.max(0, Math.round(((stat.value - (stat.min || 0)) / (stat.max - (stat.min || 0))) * 100))),
  }));
});

// 紧凑版知识技能
const knowledgeSkills = computed(() => {
  const knowledge = character.value?.knowledge ?? {};
  const skills = character.value?.skills ?? {};
  
  const topKnowledge = Object.entries(knowledge)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([subject, value]) => ({ subject, value, type: 'knowledge' }));
    
  const topSkills = Object.entries(skills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([subject, value]) => ({ subject, value, type: 'skill' }));
    
  return [...topKnowledge, ...topSkills];
});

// 紧凑版时间轴
const timeSlots = computed(() => currentDayTemplate.value?.slots ?? []);
const currentSlotInfo = computed(() => {
  const slot = timeSlots.value[currentTimeSlotIndex.value];
  return slot ? `${currentTimeSlotIndex.value + 1}. ${slot.label}` : '未知时段';
});

// 紧凑版任务列表
const urgentTasks = computed(() => [...activeTasks.value]
  .sort((a, b) => (a.priority === b.priority ? (a.deadline ?? Infinity) - (b.deadline ?? Infinity) : a.priority === 'required' ? -1 : 1))
  .slice(0, 4));

// 紧凑版行动列表
const compactActions = computed(() => availableActions.value.slice(0, 4));

// 学习状态选项
const stateOptions = computed(() => Object.values(learningStates.value ?? {}).map((config) => {
  const result = gameStore.canSwitchLearningState(config.id);
  return {
    config,
    disabled: !result.ok && config.id !== learningState.value,
  };
}));

function advanceTime() {
  gameStore.advanceTime();
}

function performAction(actionId: string) {
  gameStore.performAction(actionId, {});
}

function switchState(stateId: LearningState) {
  if (stateId === learningState.value) return;
  gameStore.switchLearningState(stateId);
}

function formatTaskProgress(task: any) {
  return Math.round((task.progress / task.workload) * 100);
}
</script>

<template>
  <section class="dashboard-layout">
    <!-- 左侧信息栏 - 角色状态 -->
    <aside class="sidebar left-sidebar">
      <article class="compact-panel status-panel">
        <header class="panel-header">
          <h3>角色状态</h3>
        </header>
        
        <div class="state-badge">
          <span class="state-label">{{ learningStateLabel }}</span>
        </div>
        
        <div class="stats-grid">
          <div v-for="stat in compactStats" :key="stat.key" class="stat-item">
            <div class="stat-info">
              <span class="stat-name">{{ stat.label }}</span>
              <span class="stat-value">{{ Math.round(stat.value) }}</span>
            </div>
            <div class="stat-bar">
              <div 
                class="stat-progress" 
                :style="{ width: `${stat.percent}%` }"
                :class="{
                  'low': stat.percent < 30,
                  'medium': stat.percent >= 30 && stat.percent < 70,
                  'high': stat.percent >= 70
                }"
              />
            </div>
          </div>
        </div>
        
        <div class="knowledge-skills">
          <h4>能力指标</h4>
          <div class="skills-list">
            <div v-for="item in knowledgeSkills" :key="item.subject + item.type" class="skill-item">
              <span class="skill-name">{{ item.subject }}</span>
              <span class="skill-value">{{ Math.round(item.value) }}</span>
            </div>
          </div>
        </div>
      </article>
    </aside>

    <!-- 中部主要内容 -->
    <main class="main-content">
      <!-- 当前时间段信息 -->
      <section class="time-info">
        <div class="time-display">
          <h2>第 {{ currentWeek }} 周 · 第 {{ dayNumber }} 日</h2>
          <p class="time-slot">{{ currentSlotInfo }}</p>
          <p class="day-template" v-if="currentDayTemplate">{{ currentDayTemplate.name }}</p>
        </div>
      </section>

      <!-- 状态切换 -->
      <section class="state-switcher">
        <h3>学习状态</h3>
        <div class="state-buttons">
          <button
            v-for="option in stateOptions"
            :key="option.config.id"
            class="state-btn"
            :class="{ 
              active: option.config.id === learningState,
              disabled: option.disabled 
            }"
            :disabled="option.disabled"
            @click="switchState(option.config.id)"
          >
            {{ option.config.name }}
          </button>
        </div>
      </section>

      <!-- 行动选项 -->
      <section class="actions-panel">
        <h3>可选行动</h3>
        <div class="actions-grid">
          <button
            v-for="action in compactActions"
            :key="action.id"
            class="action-btn"
            :class="`category-${action.category}`"
            @click="performAction(action.id)"
          >
            <span class="action-name">{{ action.name }}</span>
            <span class="action-category">{{ action.category }}</span>
          </button>
          <div v-if="!compactActions.length" class="no-actions">
            暂无可用行动
          </div>
        </div>
      </section>

      <!-- 推进时间按钮 -->
      <div class="advance-section">
        <button class="advance-btn" @click="advanceTime">
          推进到下一时段
        </button>
      </div>
    </main>

    <!-- 右侧信息栏 -->
    <aside class="sidebar right-sidebar">
      <!-- 时间表 -->
      <article class="compact-panel time-panel">
        <header class="panel-header">
          <h3>时间轴</h3>
        </header>
        
        <div class="time-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${((currentTimeSlotIndex + 1) / timeSlots.length) * 100}%` }"
            />
          </div>
          <span class="progress-text">时段 {{ currentTimeSlotIndex + 1 }}/{{ timeSlots.length }}</span>
        </div>
        
        <div class="upcoming-events">
          <h4>即将到来</h4>
          <div v-if="nextMajorEvent" class="next-event">
            {{ nextMajorEvent }}
          </div>
          <div v-else class="no-events">
            暂无重点事件
          </div>
        </div>
      </article>

      <!-- 待办任务 -->
      <article class="compact-panel tasks-panel">
        <header class="panel-header">
          <h3>待办任务</h3>
          <span class="task-count">{{ activeTasks.length }}</span>
        </header>
        
        <div class="tasks-list">
          <div v-for="task in urgentTasks" :key="task.id" class="task-item">
            <div class="task-header">
              <span class="task-name">{{ task.name }}</span>
              <span class="task-type">{{ task.type === 'daily' ? '日常' : '限时' }}</span>
            </div>
            <div class="task-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${formatTaskProgress(task)}%` }"
                  :class="{
                    'low': formatTaskProgress(task) < 30,
                    'medium': formatTaskProgress(task) >= 30 && formatTaskProgress(task) < 70,
                    'high': formatTaskProgress(task) >= 70
                  }"
                />
              </div>
              <span class="progress-text">{{ formatTaskProgress(task) }}%</span>
            </div>
            <div class="task-meta">
              <span v-if="task.deadline !== undefined" class="deadline">剩余{{ task.deadline }}天</span>
              <span class="priority" :class="task.priority">{{ task.priority === 'required' ? '必需' : '可选' }}</span>
            </div>
          </div>
          <div v-if="!urgentTasks.length" class="no-tasks">
            暂无待办任务
          </div>
        </div>
      </article>
    </aside>
  </section>
</template>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 1rem;
  min-height: 80vh;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compact-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

/* 左侧状态面板 */
.state-badge {
  background: rgba(100, 108, 255, 0.15);
  border-radius: 0.5rem;
  padding: 0.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.state-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #a5adff;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.stat-name {
  opacity: 0.8;
}

.stat-value {
  font-weight: 600;
}

.stat-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.stat-progress {
  height: 100%;
  transition: width 0.3s ease;
}

.stat-progress.low { background: #ff6b6b; }
.stat-progress.medium { background: #ffd93d; }
.stat-progress.high { background: #6bcf7f; }

.knowledge-skills h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* 中部内容 */
.time-info {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
}

.time-info h2 {
  margin: 0 0 0.25rem;
  font-size: 1.3rem;
}

.time-slot {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #72e2ae;
}

.day-template {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.state-switcher {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  padding: 1rem;
}

.state-switcher h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.state-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.state-btn {
  padding: 0.6rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-btn.active {
  background: rgba(100, 108, 255, 0.3);
  border-color: rgba(100, 108, 255, 0.5);
}

.state-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-btn:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.actions-panel {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  padding: 1rem;
  flex-grow: 1;
}

.actions-panel h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.action-btn {
  padding: 0.75rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.action-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
}

.action-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.action-category {
  font-size: 0.7rem;
  opacity: 0.7;
  text-transform: uppercase;
}

.action-btn.category-rest { border-color: rgba(114, 226, 174, 0.3); }
.action-btn.category-study { border-color: rgba(100, 108, 255, 0.3); }
.action-btn.category-task { border-color: rgba(255, 200, 87, 0.3); }

.no-actions {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
  font-size: 0.9rem;
}

.advance-section {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.advance-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #72e2ae, #4fc3f7);
  border: none;
  border-radius: 0.75rem;
  color: #04121d;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.advance-btn:hover {
  transform: translateY(-2px);
}

/* 右侧面板 */
.time-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #72e2ae, #4fc3f7);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  opacity: 0.8;
}

.upcoming-events h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.next-event {
  font-size: 0.85rem;
  padding: 0.5rem;
  background: rgba(114, 226, 174, 0.1);
  border-radius: 0.4rem;
  border-left: 3px solid #72e2ae;
}

.no-events {
  font-size: 0.8rem;
  opacity: 0.6;
  text-align: center;
  padding: 1rem;
}

/* 任务面板 */
.task-count {
  background: rgba(59, 130, 246, 0.2);
  color: #bfdbfe;
  padding: 0.2rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-name {
  font-size: 0.85rem;
  font-weight: 600;
  flex: 1;
  margin-right: 0.5rem;
}

.task-type {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.3rem;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.task-progress .progress-bar {
  flex: 1;
  margin: 0;
  height: 4px;
}

.task-progress .progress-text {
  font-size: 0.75rem;
  min-width: 2.5rem;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.7;
}

.deadline {
  color: #ffb974;
}

.priority.required {
  color: #ff6b6b;
  font-weight: 600;
}

.priority.optional {
  color: #72e2ae;
}

.no-tasks {
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "main"
      "left"
      "right";
  }
  
  .left-sidebar { grid-area: left; }
  .main-content { grid-area: main; }
  .right-sidebar { grid-area: right; }
  
  .sidebar {
    flex-direction: row;
    gap: 1rem;
  }
  
  .compact-panel {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .sidebar {
    flex-direction: column;
  }
  
  .state-buttons,
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>