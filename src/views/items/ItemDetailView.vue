<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ item?.model?.name }}</h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ item?.model?.category?.name }} • {{ item?.codeBarre || 'Sans code-barres' }}
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="showEditModal = true"
            class="btn btn-primary"
          >
            Modifier
          </button>
          <button
            @click="showMoveModal = true"
            class="btn btn-secondary"
          >
            Déplacer
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Informations principales -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Image -->
        <div v-if="item?.photoUrl" class="card">
          <div class="card-body">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Photo</h3>
            <img
              :src="item.photoUrl"
              :alt="item.model?.name"
              class="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Informations</h3>
          </div>
          <div class="card-body">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Modèle</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ item?.model?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Catégorie</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ item?.model?.category?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Code-barres</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ item?.codeBarre || 'Non défini' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">État</dt>
                <dd class="mt-1">
                  <StatusBadge :status="item?.etat || 'Non défini'" />
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Emplacement</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ item?.location?.name || 'Non localisé' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Créé le</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(item?.createdAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Historique -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Historique</h3>
          </div>
          <div class="card-body">
            <div v-if="isLoadingHistory" class="space-y-3">
              <div v-for="i in 3" :key="i" class="skeleton h-12"></div>
            </div>
            <div v-else-if="!history?.length" class="text-center py-8 text-gray-500">
              Aucun historique trouvé
            </div>
            <div v-else class="space-y-3">
              <ActivityItem
                v-for="entry in history"
                :key="entry.id"
                :activity="entry"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Affectation actuelle -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Affectation actuelle</h3>
          </div>
          <div class="card-body">
            <div v-if="currentAssignment" class="text-sm">
              <div class="font-medium text-gray-900">
                {{ currentAssignment.user?.username || currentAssignment.team?.name }}
              </div>
              <div class="text-gray-500">
                Depuis le {{ formatDate(currentAssignment.startAt) }}
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              Aucune affectation active
            </div>
          </div>
        </div>

        <!-- Statut actuel -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Statut actuel</h3>
          </div>
          <div class="card-body">
            <div v-if="currentStatus" class="text-sm">
              <StatusBadge :status="currentStatus.statusKey" />
              <div class="mt-2 text-gray-500">
                Depuis le {{ formatDate(currentStatus.startAt) }}
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              Aucun statut défini
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Actions rapides</h3>
          </div>
          <div class="card-body space-y-2">
            <button
              @click="showAssignModal = true"
              class="w-full btn btn-secondary btn-sm"
            >
              Affecter
            </button>
            <button
              @click="showStatusModal = true"
              class="w-full btn btn-secondary btn-sm"
            >
              Changer le statut
            </button>
            <button
              @click="showMoveModal = true"
              class="w-full btn btn-secondary btn-sm"
            >
              Déplacer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useItem, useItemHistory } from '@/composables/useItems'
import { useQuery } from '@tanstack/vue-query'
import { assignmentsApi } from '@/api/endpoints/assignments'
import { statusesApi } from '@/api/endpoints/statuses'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import StatusBadge from '@/components/StatusBadge.vue'
import ActivityItem from '@/components/ActivityItem.vue'

const route = useRoute()
const itemId = route.params.id as string

// Queries
const { data: item, isLoading: isLoadingItem } = useItem(itemId)
const { data: history, isLoading: isLoadingHistory } = useItemHistory(itemId)

// Affectation actuelle
const { data: assignments } = useQuery({
  queryKey: ['assignments', 'item', itemId],
  queryFn: () => assignmentsApi.getByItem(itemId),
  enabled: !!itemId,
})

// Statut actuel
const { data: currentStatus } = useQuery({
  queryKey: ['item-statuses', 'active', itemId],
  queryFn: () => statusesApi.getItemActiveStatus(itemId),
  enabled: !!itemId,
})

// État local
const showEditModal = ref(false)
const showMoveModal = ref(false)
const showAssignModal = ref(false)
const showStatusModal = ref(false)

// Computed
const currentAssignment = computed(() => {
  return assignments.value?.find(a => !a.endAt)
})

// Utilitaires
const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}
</script>
