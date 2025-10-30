<template>
  <div class="flex items-start">
    <div class="flex-shrink-0">
      <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
        <component :is="iconComponent" class="h-4 w-4 text-gray-600" />
      </div>
    </div>
    <div class="ml-3 flex-1">
      <p class="text-sm text-gray-900">
        <span class="font-medium">{{ activity.actorUser?.username || 'Système' }}</span>
        {{ getActionDescription(activity.action) }}
        <span v-if="activity.entityName" class="font-medium">{{ activity.entityName }}</span>
      </p>
      <p class="text-xs text-gray-500">
        {{ formatDateTime(activity.createdAt) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  UserIcon, 
  CubeIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/formatDate'
import type { AuditLog } from '@/types'

interface Props {
  activity: AuditLog
}

const props = defineProps<Props>()

// Icône selon le type d'entité
const iconComponent = computed(() => {
  const entityIconMap: Record<string, any> = {
    User: UserIcon,
    Item: CubeIcon,
    Transaction: CurrencyDollarIcon,
    Assignment: UserGroupIcon,
    default: DocumentTextIcon,
  }
  return entityIconMap[props.activity.entityName] || entityIconMap.default
})

// Description de l'action
const getActionDescription = (action: string) => {
  const actionMap: Record<string, string> = {
    'users.create': 'a créé l\'utilisateur',
    'users.update': 'a modifié l\'utilisateur',
    'users.delete': 'a supprimé l\'utilisateur',
    'items.create': 'a créé l\'item',
    'items.update': 'a modifié l\'item',
    'items.delete': 'a supprimé l\'item',
    'items.move': 'a déplacé l\'item',
    'transactions.create': 'a créé la transaction',
    'assignments.create': 'a créé l\'affectation',
    'assignments.close': 'a clôturé l\'affectation',
  }
  return actionMap[action] || 'a effectué une action sur'
}

// Le formatage de date est maintenant importé depuis @/utils/formatDate
</script>
