<template>
  <div>
    <label class="form-label mb-3">
      Statuts
    </label>
    <div v-if="isLoading" class="text-sm text-gray-500">
      Chargement des statuts...
    </div>
    <div v-else>
      <div v-for="group in statusGroups" :key="group" class="mb-4">
        <h5 class="text-sm font-medium text-gray-700 mb-2">{{ groupLabels[group] }}</h5>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in statusesByGroup[group]"
            :key="status.id"
            type="button"
            @click="toggleStatus(group, status.key)"
            :class="[
              'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2',
              isStatusSelected(group, status.key)
                ? 'ring-2 ring-offset-2 ring-gray-900 shadow-md scale-105'
                : 'opacity-70 hover:opacity-100',
              getStatusButtonClasses(status)
            ]"
            :style="getStatusButtonStyle(status)"
          >
            {{ status.label }}
          </button>
        </div>
        <p v-if="statusesByGroup[group].length === 0" class="text-xs text-gray-400 italic">
          Aucun statut disponible pour ce groupe
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Status, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'

interface Props {
  modelValue: Map<StatusGroup, string>
  statuses: Status[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Map<StatusGroup, string>]
}>()

// Groupes de statuts
const statusGroups: StatusGroup[] = [
  StatusGroupEnum.COMMERCIAL,
  StatusGroupEnum.AUDIENCE,
  StatusGroupEnum.CONDITION,
  StatusGroupEnum.LIFECYCLE,
]

// Labels des groupes
const groupLabels: Record<StatusGroup, string> = {
  [StatusGroupEnum.COMMERCIAL]: 'Commercial',
  [StatusGroupEnum.AUDIENCE]: 'Audience',
  [StatusGroupEnum.CONDITION]: 'Condition',
  [StatusGroupEnum.LIFECYCLE]: 'Cycle de vie',
}

// Organiser les statuts par groupe
const statusesByGroup = computed(() => {
  const grouped: Record<StatusGroup, Status[]> = {
    [StatusGroupEnum.COMMERCIAL]: [],
    [StatusGroupEnum.AUDIENCE]: [],
    [StatusGroupEnum.CONDITION]: [],
    [StatusGroupEnum.LIFECYCLE]: [],
  }

  const activeStatuses = (props.statuses || []).filter(
    (status: Status) => status.isActive !== false
  )

  activeStatuses.forEach((status: Status) => {
    if (status.group && grouped[status.group]) {
      grouped[status.group].push(status)
    }
  })

  // Trier chaque groupe par sortOrder puis par label
  Object.keys(grouped).forEach((group) => {
    grouped[group as StatusGroup].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
    )
  })

  return grouped
})

// Vérifier si un statut est sélectionné pour un groupe
const isStatusSelected = (group: StatusGroup, statusKey: string): boolean => {
  return props.modelValue.get(group) === statusKey
}

// Toggle la sélection d'un statut
const toggleStatus = (group: StatusGroup, statusKey: string) => {
  const newMap = new Map(props.modelValue)
  
  // Si le statut est déjà sélectionné, le désélectionner
  if (newMap.get(group) === statusKey) {
    newMap.delete(group)
  } else {
    // Sinon, sélectionner ce statut (remplace l'ancien du même groupe)
    newMap.set(group, statusKey)
  }
  
  emit('update:modelValue', newMap)
}

// Fonction pour obtenir le style d'un badge de statut
const getStatusButtonStyle = (status: Status) => {
  if (status.color && status.color.startsWith('#')) {
    // Calculer la couleur de texte (noir ou blanc selon la luminosité)
    const hex = status.color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    const textColor = luminance > 0.5 ? '#1f2937' : '#ffffff'
    
    return {
      backgroundColor: status.color,
      color: textColor,
    }
  }
  return {}
}

// Fonction pour obtenir les classes CSS d'un badge de statut
const getStatusButtonClasses = (status: Status) => {
  if (status.color && status.color.startsWith('#')) {
    return ''
  }
  
  // Couleurs par défaut selon le groupe
  const groupColors: Record<StatusGroup, string> = {
    [StatusGroupEnum.COMMERCIAL]: 'bg-primary-100 text-primary-800',
    [StatusGroupEnum.AUDIENCE]: 'bg-success-100 text-success-800',
    [StatusGroupEnum.CONDITION]: 'bg-warning-100 text-warning-800',
    [StatusGroupEnum.LIFECYCLE]: 'bg-danger-100 text-danger-800',
  }
  
  return groupColors[status.group] || 'bg-gray-100 text-gray-800'
}
</script>
