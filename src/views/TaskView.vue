<script setup lang="ts">
import TaskPanel from '../components/TaskPanel/TaskPanel.vue';
</script>

<template>
  <section class="view-shell">
    <header class="view-header">
      <div>
        <h2>任务详情</h2>
        <p>管理日常与限时任务，查看进度并推进完成度。</p>
      </div>
    </header>
    <TaskPanel />
  </section>
</template>

