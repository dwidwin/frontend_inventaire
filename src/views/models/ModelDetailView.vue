<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ model?.name }}</h1>
          <p class="mt-1 text-sm text-gray-600">
            <span v-if="model?.categories && model.categories.length > 0">
              {{ model.categories.map(c => c.name).join(', ') }}
            </span>
            <span v-else>Sans catégorie</span>
            <span v-if="model?.location"> • 📍 {{ model.location.name }}</span>
            <span v-if="model?.etat"> • État: {{ model.etat }}</span>
          </p>
        </div>
        <div v-if="authStore.canWrite" class="flex items-center space-x-3">
          <button
            @click="showEditModal = true"
            class="btn btn-secondary"
          >
            Modifier le modèle
          </button>
        </div>
      </div>
    </div>

    <!-- Informations du modèle -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div class="lg:col-span-2">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Informations du modèle</h3>
          </div>
          <div class="card-body">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nom</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Catégories</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span v-if="model?.categories && model.categories.length > 0">
                    {{ model.categories.map(c => c.name).join(', ') }}
                  </span>
                  <span v-else class="text-gray-500">Aucune catégorie</span>
                </dd>
              </div>
              <div v-if="model?.referenceFournisseur">
                <dt class="text-sm font-medium text-gray-500">Référence fournisseur</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model.referenceFournisseur }}</dd>
              </div>
              <div v-if="model?.location">
                <dt class="text-sm font-medium text-gray-500">Emplacement</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model.location.name }}</dd>
              </div>
              <div v-if="model?.codeBarre">
                <dt class="text-sm font-medium text-gray-500">Code-barres</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ model.codeBarre }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">État</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model?.etat || 'en_stock' }}</dd>
              </div>
              <div v-if="model?.description" class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ model.description }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Image du modèle -->
        <div v-if="model?.mainImageUrl" class="card mt-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Image du modèle</h3>
          </div>
          <div class="card-body">
            <img
              :src="model.mainImageUrl"
              :alt="model.name"
              class="w-full h-64 object-contain rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Actions rapides -->
        <div v-if="authStore.canWrite" class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Actions rapides</h3>
          </div>
          <div class="card-body space-y-2">
            <button
              @click="showEditModal = true"
              class="w-full btn btn-secondary btn-sm"
            >
              Modifier le modèle
            </button>
            <button
              @click="showMoveModal = true"
              class="w-full btn btn-secondary btn-sm"
            >
              Déplacer
            </button>
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
              Changer statut
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Historique et affectations -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Affectations -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Affectations</h3>
        </div>
        <div class="card-body">
          <div v-if="isLoadingAssignments" class="text-center py-8 text-gray-500">
            Chargement...
          </div>
          <div v-else-if="!assignments || assignments.length === 0" class="text-center py-8 text-gray-500">
            Aucune affectation
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="assignment in assignments"
              :key="assignment.id"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="text-sm font-medium text-gray-900">
                {{ assignment.user?.username || assignment.team?.name || 'Inconnu' }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Depuis le {{ formatDate(assignment.startAt) }}
                <span v-if="assignment.endAt"> jusqu'au {{ formatDate(assignment.endAt) }}</span>
                <span v-else class="text-green-600"> (Active)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statuts actifs -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Statuts actifs</h3>
        </div>
        <div class="card-body">
          <div v-if="isLoadingStatuses" class="text-center py-8 text-gray-500">
            Chargement...
          </div>
          <div v-else-if="!activeStatuses || activeStatuses.length === 0" class="text-center py-8 text-gray-500">
            Aucun statut actif
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <StatusBadge
              v-for="itemStatus in activeStatuses"
              :key="itemStatus.status?.id || itemStatus.statusKey"
              :status="itemStatus.status"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Historique -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Historique</h3>
      </div>
      <div class="card-body">
        <div v-if="isLoadingHistory" class="text-center py-8 text-gray-500">
          Chargement de l'historique...
        </div>
        <div v-else-if="!history || history.length === 0" class="text-center py-8 text-gray-500">
          Aucun historique
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="entry in history"
            :key="entry.id"
            class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">{{ entry.title }}</div>
              <div v-if="entry.description" class="text-xs text-gray-600 mt-1">{{ entry.description }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDateTime(entry.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <EditModelModal
      v-if="showEditModal && model"
      :model="model"
      @close="showEditModal = false"
      @updated="handleModelUpdated"
    />
    
    <MoveModelModal
      v-if="showMoveModal && model"
      :model="model"
      @close="showMoveModal = false"
      @moved="handleModelMoved"
    />
    
    <AssignModelModal
      v-if="showAssignModal && model"
      :modelId="model.id"
      @close="showAssignModal = false"
      @created="handleAssignmentCreated"
    />
    
    <SetItemStatusModal
      v-if="showStatusModal && model"
      :modelId="model.id"
      @close="showStatusModal = false"
      @updated="handleStatusUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMaterialModel, useModelHistory } from '@/composables/useMaterialModels'
import { useAssignmentsByModel } from '@/composables/useAssignments'
import { useModelActiveStatus } from '@/composables/useStatuses'
import EditModelModal from '@/components/modals/EditModelModal.vue'
import MoveModelModal from '@/components/modals/MoveModelModal.vue'
import AssignModelModal from '@/components/modals/AssignModelModal.vue'
import SetItemStatusModal from '@/components/modals/SetItemStatusModal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { formatDate, formatDateTime } from '@/utils/formatDate'

const authStore = useAuthStore()
const route = useRoute()
const modelId = route.params.id as string

// Queries
const { data: model, isLoading: isLoadingModel } = useMaterialModel(modelId)
const { data: assignments, isLoading: isLoadingAssignments } = useAssignmentsByModel(modelId)
const { data: activeStatuses, isLoading: isLoadingStatuses } = useModelActiveStatus(modelId)
const { data: history, isLoading: isLoadingHistory } = useModelHistory(modelId)

// État local
const showEditModal = ref(false)
const showMoveModal = ref(false)
const showAssignModal = ref(false)
const showStatusModal = ref(false)

// Actions
const handleModelUpdated = () => {
  showEditModal.value = false
}

const handleModelMoved = () => {
  showMoveModal.value = false
}

const handleAssignmentCreated = () => {
  showAssignModal.value = false
}

const handleStatusUpdated = () => {
  showStatusModal.value = false
}
</script>

