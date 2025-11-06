import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/problem/:id',
      name: 'problem',
      component: () => import('@/views/ProblemView.vue'),
      props: true,
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('@/views/TagsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'users-admin',
      component: () => import('@/views/admin/UsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/problems/create',
      name: 'create-problem',
      component: () => import('@/views/CreateProblemView.vue'),
      meta: { requiresAuth: true, requiresCreator: true },
    },
    {
      path: '/problems/edit/:id',
      name: 'edit-problem',
      component: () => import('@/views/CreateProblemView.vue'),
      meta: { requiresAuth: true, requiresCreator: true },
      props: true,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.requiresCreator) {
    await authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
  } else if (
    to.meta.requiresCreator &&
    !(authStore.user?.role === 'admin' || authStore.user?.role === 'interviewer')
  ) {
    next('/')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
