import { createRouter, createWebHistory } from 'vue-router';
import useAuthStore from '../store/auth';

import { useSocketStore } from '../store/socket';
import loginRouter from '../views/Login/router';
import userRouter from '../views/User/router';
import fieldRouter from '../views/Fields/router';
import homeRouter from '../views/Home/router';
import scrollRestoration from '../plugins/scrollRestoration';
import headRouter from '../views/Head/router';

const withScroll = (route) => ({
  ...route,
  meta: {
    ...(route.meta || {}),
    saveScroll: true,
    restoreScroll: true,
    scrollContainer: '.ant-table-body',
  },
});
const routes = [
  {
    path: '/admin',
    component: () => import('../layout/AdminLayout.vue'),
    meta: { auth: true },
    redirect: { name: 'users' },
    children: [...userRouter, ...fieldRouter].map((row) => withScroll(row)),
  },
  {
    path: '/',
    component: () => import('../layout/UserLayout.vue'),
    meta: { auth: true },
    redirect: { name: 'home' },
    children: [...homeRouter].map((row) => withScroll(row)),
  },

  {
    path: '/head',
    component: () => import('../layout/HeadLayout.vue'),
    meta: { auth: true },
    redirect: { name: 'head' },
    children: [...headRouter].map((row) => withScroll(row)),
  },

  ...loginRouter,
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { left: 0, top: 0 };
  },
});

scrollRestoration(router);

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const socketStore = useSocketStore();

  if (!authStore.user && !authStore.isLoading) {
    await authStore.fetchCurrentUser();
  }

  // 🔐 Auth check
  if (to.meta?.auth) {
    if (!authStore.isLoggedIn) {
      return next({ name: 'login' });
    }

    // 🎭 Role check
    if (to.meta.role) {
      const role = authStore.user?.role;

      if (!to.meta.role.includes(role)) {
        if (role === 'admin') return next({ name: 'users' });
        if (role === 'user') return next({ name: 'home' });
        if (role === 'head') return next({ name: 'head' });
      }
    }
  }

  return next();
});

export default router;
