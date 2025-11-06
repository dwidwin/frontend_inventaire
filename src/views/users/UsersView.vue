<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Utilisateurs</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des utilisateurs et des rôles
      </p>
    </div>

    <!-- Actions -->
    <div v-if="authStore.canWrite" class="mb-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter un utilisateur
        </button>
        <button
          v-if="authStore.isAdmin"
          @click="pendingOnly = !pendingOnly"
          :class="[
            'btn',
            pendingOnly ? 'btn-primary' : 'btn-secondary'
          ]"
        >
          {{ pendingOnly ? 'Tous les utilisateurs' : 'Comptes en attente' }}
        </button>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <DataTable
      :data="usersData || []"
      :columns="columns"
      :is-loading="isLoading"
      title="Liste des utilisateurs"
      :show-edit="authStore.canWrite"
      :show-delete="authStore.canWrite"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #cell-role="{ item }">
        <StatusBadge
          :status="item.role"
          :color="getRoleColor(item.role)"
        />
      </template>
      
      <template #cell-isActive="{ item }">
        <div class="flex items-center space-x-2">
          <StatusBadge
            :status="item.isActive ? 'Actif' : 'En attente'"
            :color="item.isActive ? 'success' : 'warning'"
          />
          <button
            v-if="!item.isActive && authStore.isAdmin"
            @click="handleActivate(item)"
            :disabled="isActivating"
            class="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modal d'édition -->
    <EditUserModal
      v-if="showEditUserModal && selectedUser"
      :user="selectedUser"
      @close="showEditUserModal = false"
      @updated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useUsers, useActivateAccount } from '@/composables/useUsers'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import EditUserModal from '@/components/modals/EditUserModal.vue'
import type { User } from '@/types'

const authStore = useAuthStore()

// État local
const pendingOnly = ref(false)
const showCreateModal = ref(false)
const showEditUserModal = ref(false)
const selectedUser = ref<User | null>(null)

// Queries
const { data: usersResponse, isLoading } = useUsers(
  computed(() => ({ pendingOnly: pendingOnly.value }))
)

const usersData = computed(() => usersResponse.value?.data || [])

// Mutations
const { mutate: activateAccount, isPending: isActivating } = useActivateAccount()

// Colonnes du tableau
const columns = [
  { key: 'username', label: 'Nom d\'utilisateur', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rôle', sortable: true },
  { key: 'isActive', label: 'Statut', sortable: true },
  { key: 'createdAt', label: 'Créé le', sortable: true },
]

// Actions
const handleEdit = (user: User) => {
  selectedUser.value = user
  showEditUserModal.value = true
}

const handleDelete = (user: User) => {
  selectedUser.value = user
  // TODO: Ouvrir modal de confirmation
  console.log('Delete user:', user)
}

const handleActivate = (user: User) => {
  if (confirm(`Voulez-vous activer le compte de ${user.username} ?`)) {
    activateAccount(user.id)
  }
}

const handleUserUpdated = () => {
  showEditUserModal.value = false
  selectedUser.value = null
}

// Utilitaires
const getRoleColor = (role: string) => {
  const roleColors = {
    ADMIN: 'danger',
    MANAGER: 'warning',
    USER: 'primary',
  }
  return roleColors[role as keyof typeof roleColors] || 'gray'
}
</script>
