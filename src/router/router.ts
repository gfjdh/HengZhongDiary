import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '概览' },
  },
  {
    path: '/status',
    name: 'status',
    component: () => import('../views/StatusView.vue'),
    meta: { title: '状态详情' },
  },
  {
    path: '/actions',
    name: 'actions',
    component: () => import('../views/ActionView.vue'),
    meta: { title: '行动详情' },
  },
  {
    path: '/time',
    name: 'time',
    component: () => import('../views/TimeView.vue'),
    meta: { title: '时间详情' },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../views/TaskView.vue'),
    meta: { title: '任务详情' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `衡中日记 · ${String(to.meta.title)}`;
  }
});

export default router;
