<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Équipes</h1>
      <p class="mt-1 text-sm text-gray-600">
        Gestion des équipes sportives
      </p>
    </div>

    <!-- Actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter une équipe
        </button>
      </div>
    </div>

    <!-- Liste des équipes -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="skeleton h-16"></div>
    </div>
    
    <div v-else-if="!teams?.length" class="text-center py-8 text-gray-500">
      Aucune équipe trouvée
    </div>
    
    <div v-else class="space-y-3">
      <TeamCard
        v-for="team in teams"
        :key="team.id"
        :team="team"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useQuery } from '@tanstack/vue-query'
import { teamsApi } from '@/api/endpoints/teams'
import TeamCard from '@/components/TeamCard.vue'
import type { Team } from '@/types'

// Queries
const { data: teams, isLoading } = useQuery({
  queryKey: ['teams'],
  queryFn: () => teamsApi.list(),
})

// État local
const showCreateModal = ref(false)
const selectedTeam = ref<Team | null>(null)

// Actions
const handleEdit = (team: Team) => {
  selectedTeam.value = team
  // TODO: Ouvrir modal d'édition
  console.log('Edit team:', team)
}

const handleDelete = (team: Team) => {
  selectedTeam.value = team
  // TODO: Ouvrir modal de confirmation
  console.log('Delete team:', team)
}
</script>
