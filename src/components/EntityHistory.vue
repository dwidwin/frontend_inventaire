<template>
  <div v-if="entity" class="mt-6 pt-6 border-t border-gray-200">
    <h4 class="text-sm font-medium text-gray-900 mb-4">Historique</h4>
    <div class="space-y-3">
      <!-- Création -->
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <PlusIcon class="w-4 h-4 text-green-600" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">Créé</p>
          <p class="text-sm text-gray-600">
            <span v-if="entity.createdBy">
              par <span class="font-medium">{{ entity.createdBy.username || entity.createdBy.email }}</span>
            </span>
            <span v-else class="text-gray-400">par un utilisateur inconnu</span>
            <span v-if="entity.createdAt" class="ml-2">
              le <span class="font-medium">{{ formatDateTime(entity.createdAt) }}</span>
            </span>
          </p>
        </div>
      </div>

      <!-- Modification -->
      <div v-if="entity.updatedAt && entity.updatedAt !== entity.createdAt" class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <PencilIcon class="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">Modifié</p>
          <p class="text-sm text-gray-600">
            <span v-if="entity.updatedBy">
              par <span class="font-medium">{{ entity.updatedBy.username || entity.updatedBy.email }}</span>
            </span>
            <span v-else class="text-gray-400">par un utilisateur inconnu</span>
            <span v-if="entity.updatedAt" class="ml-2">
              le <span class="font-medium">{{ formatDateTime(entity.updatedAt) }}</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/formatDate'
import type { BaseEntity, User } from '@/types'

interface EntityWithHistory extends BaseEntity {
  createdBy?: User
  updatedBy?: User
}

interface Props {
  entity: EntityWithHistory | null | undefined
}

defineProps<Props>()
</script>

