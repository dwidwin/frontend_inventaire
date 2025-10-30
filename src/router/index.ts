import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import des vues
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import CatalogueView from '@/views/catalogue/CatalogueView.vue'
import ItemsView from '@/views/items/ItemsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth layout avec page de login
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        { path: '', name: 'Login', component: LoginView }
      ]
    },

    // Main layout pour toutes les routes protégées
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'Dashboard', component: DashboardView },
        { path: 'catalogue', name: 'Catalogue', component: CatalogueView },
        { path: 'items', name: 'Items', component: ItemsView },
        { path: 'items/:id', name: 'ItemDetail', component: () => import('@/views/items/ItemDetailView.vue') },
        { path: 'locations', name: 'Locations', component: () => import('@/views/locations/LocationsView.vue') },
        { path: 'assignments', name: 'Assignments', component: () => import('@/views/assignments/AssignmentsView.vue') },
        { path: 'transactions', name: 'Transactions', component: () => import('@/views/transactions/TransactionsView.vue') },
        { path: 'teams', name: 'Teams', component: () => import('@/views/teams/TeamsView.vue') },
        { path: 'users', name: 'Users', component: () => import('@/views/users/UsersView.vue'), meta: { requiresManager: true } },
        { path: 'notifications', name: 'Notifications', component: () => import('@/views/notifications/NotificationsView.vue') },
        { path: 'audit', name: 'Audit', component: () => import('@/views/audit/AuditView.vue'), meta: { requiresManager: true } },
        { path: ':pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
      ]
    }
  ]
})

// Guard d'authentification
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialiser l'auth si nécessaire
  if (!authStore.isAuthenticated && authStore.accessToken) {
    await authStore.initialize()
  }
  
  // Vérifier l'authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Vérifier les permissions manager
  if (to.meta.requiresManager && !authStore.isManager) {
    next('/')
    return
  }
  
  // Rediriger vers dashboard si déjà connecté et sur login
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
