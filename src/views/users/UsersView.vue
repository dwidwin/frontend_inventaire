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
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <DataTable
      :data="users || []"
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
        <StatusBadge
          :status="item.isActive ? 'Actif' : 'Inactif'"
          :color="item.isActive ? 'success' : 'danger'"
        />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useUsers } from '@/composables/useUsers'
import DataTable from '@/components/DataTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { User } from '@/types'

const authStore = useAuthStore()

// Queries
const { data: users, isLoading } = useUsers()

// État local
const showCreateModal = ref(false)
const selectedUser = ref<User | null>(null)

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
  // TODO: Ouvrir modal d'édition
  console.log('Edit user:', user)
}

const handleDelete = (user: User) => {
  selectedUser.value = user
  // TODO: Ouvrir modal de confirmation
  console.log('Delete user:', user)
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
