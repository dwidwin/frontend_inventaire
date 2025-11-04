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
        <div v-if="authStore.canWrite" class="flex items-center space-x-3">
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
                  <div class="flex flex-wrap gap-1">
                    <template v-if="activeStatusesByGroup && Object.values(activeStatusesByGroup).some(s => s)">
                      <StatusBadge 
                        v-for="itemStatus in Object.values(activeStatusesByGroup).filter(s => s && s.status)"
                        :key="itemStatus.status?.id"
                        :status="itemStatus.status" 
                      />
                    </template>
                    <StatusBadge v-else status="Non défini" />
                  </div>
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
            <div v-if="isLoadingStatusHistory" class="space-y-3">
              <div v-for="i in 3" :key="i" class="skeleton h-12"></div>
            </div>
            <div v-else-if="!statusHistory?.length" class="text-center py-8 text-gray-500">
              Aucun historique trouvé
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="s in statusHistory"
                :key="s.id"
                class="flex items-start"
              >
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span class="h-4 w-4 inline-block rounded-full" :style="{ backgroundColor: '#9CA3AF' }"></span>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-sm text-gray-900">
                      <span class="font-medium">{{ s.setBy?.username || 'Système' }}</span>
                      a défini le statut
                    </span>
                    <StatusBadge v-if="s.status" :status="s.status" />
                    <StatusBadge v-else :status="s.statusKey || 'Inconnu'" />
                  </div>
                  <p class="text-xs text-gray-500">
                    {{ formatDateTime(s.startAt) }}
                    <span v-if="s.endAt"> - {{ formatDateTime(s.endAt) }}</span>
                  </p>
                  <p v-if="s.notes" class="text-xs text-gray-600 italic mt-1">
                    {{ s.notes }}
                  </p>
                </div>
              </div>
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

        <!-- Statuts actifs -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Statuts actifs</h3>
          </div>
          <div class="card-body">
            <div v-if="activeStatusesByGroup && Object.keys(activeStatusesByGroup).some(g => activeStatusesByGroup[g as StatusGroup])" class="space-y-3">
              <div
                v-for="(itemStatus, group) in activeStatusesByGroup"
                :key="group"
                v-if="itemStatus && itemStatus.status"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-gray-500 uppercase">
                    {{ getGroupLabel(group as StatusGroup) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <StatusBadge :status="itemStatus.status" />
                  <span class="text-xs text-gray-500">
                    {{ formatDate(itemStatus.startAt) }}
                  </span>
                </div>
                <div v-if="itemStatus.notes" class="mt-2 text-xs text-gray-600 italic">
                  {{ itemStatus.notes }}
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              Aucun statut défini
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div v-if="authStore.canWrite" class="card">
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

    <!-- Modals -->
    <EditItemModal
      v-if="showEditModal && item"
      :item="item"
      @close="showEditModal = false"
      @updated="handleItemUpdated"
    />
    <SetItemStatusModal
      v-if="showStatusModal"
      :item-id="itemId"
      @close="showStatusModal = false"
      @updated="handleStatusUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useItem } from '@/composables/useItems'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { assignmentsApi } from '@/api/endpoints/assignments'
import { statusesApi } from '@/api/endpoints/statuses'
import { useItemActiveStatusByGroup, useItemStatusHistory } from '@/composables/useStatuses'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import StatusBadge from '@/components/StatusBadge.vue'
import EditItemModal from '@/components/modals/EditItemModal.vue'
import SetItemStatusModal from '@/components/modals/SetItemStatusModal.vue'
import { StatusGroup } from '@/types'

const authStore = useAuthStore()
const queryClient = useQueryClient()

const route = useRoute()
const itemId = route.params.id as string

// Queries
const { data: item, isLoading: isLoadingItem } = useItem(itemId)

// Historique des statuts de l'item
const { data: statusHistory, isLoading: isLoadingStatusHistory } = useItemStatusHistory(itemId)

// Affectation actuelle
const { data: assignments } = useQuery({
  queryKey: ['assignments', 'item', itemId],
  queryFn: () => assignmentsApi.getByItem(itemId),
  enabled: !!itemId,
})

// Statuts actifs groupés par groupe
const activeStatusesByGroup = useItemActiveStatusByGroup(itemId)

// État local
const showEditModal = ref(false)
const showMoveModal = ref(false)
const showAssignModal = ref(false)
const showStatusModal = ref(false)

// Computed
const currentAssignment = computed(() => {
  return assignments.value?.find(a => !a.endAt)
})

// Fonction pour obtenir le label du groupe
const getGroupLabel = (group: StatusGroup): string => {
  const labels: Record<StatusGroup, string> = {
    [StatusGroup.COMMERCIAL]: 'Commercial',
    [StatusGroup.AUDIENCE]: 'Audience',
    [StatusGroup.CONDITION]: 'Condition',
    [StatusGroup.LIFECYCLE]: 'Cycle de vie',
  }
  return labels[group] || group
}

// Handlers
const handleItemUpdated = () => {
  showEditModal.value = false
  // Invalider la requête pour recharger les données de l'item
  queryClient.invalidateQueries({ queryKey: ['items', itemId] })
}

const handleStatusUpdated = () => {
  showStatusModal.value = false
}
</script>
