<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-600">
        Vue d'ensemble de votre inventaire et des activités récentes
      </p>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Total Items"
        :value="stats.totalItems"
        icon="CubeIcon"
        color="primary"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Affectations Actives"
        :value="stats.activeAssignments"
        icon="UserGroupIcon"
        color="success"
        :loading="isLoadingStats"
      />
      <StatCard
        title="Transactions ce mois"
        :value="stats.monthlyTransactions"
        icon="CurrencyDollarIcon"
        color="warning"
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

    <!-- Actions rapides -->
    <div class="mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="Ajouter un item"
          description="Enregistrer un nouveau matériel"
          icon="PlusIcon"
          href="/items"
          color="primary"
        />
        <QuickActionCard
          title="Nouvelle affectation"
          description="Affecter du matériel"
          icon="UserGroupIcon"
          href="/assignments"
          color="success"
        />
        <QuickActionCard
          title="Créer une location"
          description="Enregistrer une location"
          icon="CurrencyDollarIcon"
          href="/transactions"
          color="warning"
        />
        <QuickActionCard
          title="Scanner code-barres"
          description="Rechercher par code-barres"
          icon="QrCodeIcon"
          href="/items"
          color="primary"
        />
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
import { useItems } from '@/composables/useItems'
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead } from '@/composables/useNotifications'
import { useQuery } from '@tanstack/vue-query'
import { assignmentsApi } from '@/api/endpoints/assignments'
import { transactionsApi } from '@/api/endpoints/transactions'
import { auditApi } from '@/api/endpoints/audit'
import StatCard from '@/components/StatCard.vue'
import QuickActionCard from '@/components/QuickActionCard.vue'
import NotificationItem from '@/components/NotificationItem.vue'
import ActivityItem from '@/components/ActivityItem.vue'

// Queries
const { data: items, isLoading: isLoadingItems } = useItems()
const { data: notifications, isLoading: isLoadingNotifications } = useNotifications()
const unreadNotificationsCount = useUnreadNotificationsCount()
const markAsReadMutation = useMarkNotificationAsRead()

// Affectations actives
const { data: activeAssignments, isLoading: isLoadingAssignments } = useQuery({
  queryKey: ['assignments', 'active'],
  queryFn: () => assignmentsApi.getActive(),
})

// Transactions du mois
const { data: monthlyTransactions, isLoading: isLoadingTransactions } = useQuery({
  queryKey: ['transactions', 'monthly'],
  queryFn: () => transactionsApi.list(),
})

// Activité récente (audit)
const { data: recentActivity, isLoading: isLoadingAudit } = useQuery({
  queryKey: ['audit', 'recent'],
  queryFn: () => auditApi.list({ limit: 5 }),
})

// Statistiques calculées
const stats = computed(() => ({
  totalItems: items.value?.length || 0,
  activeAssignments: activeAssignments.value?.length || 0,
  monthlyTransactions: monthlyTransactions.value?.length || 0,
}))

const isLoadingStats = computed(() => 
  isLoadingItems.value || isLoadingAssignments.value || isLoadingTransactions.value
)

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
    console.error('Erreur lors du marquage de la notification:', error)
  }
}
</script>
