<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-600">
        Vue d'ensemble de votre inventaire et des activités récentes
      </p>
    </div>

    <!-- Statistiques KPI -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Total modèles"
        :value="stats?.totalModels ?? 0"
        icon="CubeIcon"
        color="primary"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Matériel loué"
        :value="stats?.rentedCount ?? 0"
        icon="TruckIcon"
        color="warning"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Disponible à la location"
        :value="stats?.availableForRentalCount ?? 0"
        icon="CheckCircleIcon"
        color="success"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Matériel affecté"
        :value="stats?.assignedCount ?? 0"
        icon="UserGroupIcon"
        color="primary"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Matériel non affecté"
        :value="stats?.unassignedCount ?? 0"
        icon="UserMinusIcon"
        color="primary"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Locations en cours"
        :value="stats?.activeRentalsCount ?? 0"
        icon="CalendarDaysIcon"
        color="warning"
        :loading="isLoadingStats"
      />
      <StatCard
        v-if="stats?.overdueRentalsCount != null"
        title="Retards"
        :value="stats.overdueRentalsCount"
        icon="ExclamationTriangleIcon"
        color="danger"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Notifications non lues"
        :value="unreadNotificationsCount"
        icon="BellIcon"
        color="danger"
        :loading="isLoadingNotifications"
      />
    </div>

    <!-- Tableaux par catégorie -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
      <!-- Matériel loué par catégorie -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Matériel loué par catégorie</h3>
        </div>
        <div class="card-body">
          <div v-if="isLoadingStats" class="space-y-2">
            <div v-for="i in 4" :key="i" class="skeleton h-10"></div>
          </div>
          <div v-else-if="!stats?.rentedByCategory?.length" class="text-center py-8 text-gray-500">
            Aucun matériel loué
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="row in stats.rentedByCategory" :key="row.categoryId">
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ row.categoryName }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{{ row.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Matériel disponible par catégorie -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Matériel disponible à la location par catégorie</h3>
        </div>
        <div class="card-body">
          <div v-if="isLoadingStats" class="space-y-2">
            <div v-for="i in 4" :key="i" class="skeleton h-10"></div>
          </div>
          <div v-else-if="!stats?.availableByCategory?.length" class="text-center py-8 text-gray-500">
            Aucun matériel disponible
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="row in stats.availableByCategory" :key="row.categoryId">
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ row.categoryName }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{{ row.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Notifications récentes -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Notifications récentes</h3>
        </div>
        <div class="card-body">
          <div v-if="isLoadingNotifications" class="space-y-3">
            <div v-for="i in 3" :key="i" class="skeleton h-16"></div>
          </div>
          <div v-else-if="!recentNotifications?.length" class="text-center py-8 text-gray-500">
            Aucune notification récente
          </div>
          <div v-else class="space-y-3">
            <NotificationItem
              v-for="notification in recentNotifications"
              :key="notification.id"
              :notification="notification"
              @mark-read="markAsRead"
            />
          </div>
        </div>
        <div v-if="recentNotifications?.length" class="card-footer">
          <RouterLink
            to="/notifications"
            class="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Voir toutes les notifications
          </RouterLink>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Activité récente</h3>
        </div>
        <div class="card-body">
          <div v-if="isLoadingAudit" class="space-y-3">
            <div v-for="i in 5" :key="i" class="skeleton h-12"></div>
          </div>
          <div v-else-if="!recentActivity?.length" class="text-center py-8 text-gray-500">
            Aucune activité récente
          </div>
          <div v-else class="space-y-3">
            <ActivityItem
              v-for="activity in recentActivity"
              :key="activity.id"
              :activity="activity"
            />
          </div>
        </div>
        <div v-if="recentActivity?.length" class="card-footer">
          <RouterLink
            to="/audit"
            class="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Voir l'audit complet
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead } from '@/composables/useNotifications'
import { useQuery } from '@tanstack/vue-query'
import { dashboardApi } from '@/api/endpoints/dashboard'
import { auditApi } from '@/api/endpoints/audit'
import { logger } from '@/utils/logger'
import StatCard from '@/components/StatCard.vue'
import NotificationItem from '@/components/NotificationItem.vue'
import ActivityItem from '@/components/ActivityItem.vue'

// Stats dashboard (nouvel endpoint)
const { data: stats, isLoading: isLoadingStats } = useQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: () => dashboardApi.getStats(),
})

// Notifications
const { data: notifications, isLoading: isLoadingNotifications } = useNotifications()
const unreadNotificationsCount = useUnreadNotificationsCount()
const markAsReadMutation = useMarkNotificationAsRead()

// Activité récente (audit)
const { data: recentActivity, isLoading: isLoadingAudit } = useQuery({
  queryKey: ['audit', 'recent'],
  queryFn: () => auditApi.list({ limit: 5 }),
})

// Notifications récentes (5 dernières)
const recentNotifications = computed(() => {
  if (!notifications.value) return []
  return notifications.value.slice(0, 5)
})

// Marquer une notification comme lue
const markAsRead = async (id: string) => {
  try {
    await markAsReadMutation.mutateAsync(id)
  } catch (error) {
    logger.error('Erreur lors du marquage de la notification:', error)
  }
}
</script>
