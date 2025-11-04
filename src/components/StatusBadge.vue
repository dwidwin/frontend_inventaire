<template>
  <span 
    :class="badgeClasses"
    :style="badgeStyle"
  >
    {{ displayLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Status, StatusGroup } from '@/types'
import { StatusGroup as StatusGroupEnum } from '@/types'

interface Props {
  status?: string | Status
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray'
})

const statusObject = computed<Status | null>(() => {
  if (!props.status) return null
  if (typeof props.status === 'object') return props.status
  return null
})

const displayLabel = computed(() => {
  if (statusObject.value?.label) {
    return statusObject.value.label
  }
  if (typeof props.status === 'string') {
    return props.status
  }
  return 'Non défini'
})

const badgeStyle = computed(() => {
  // Si le backend fournit une couleur hexadécimale, l'utiliser
  if (statusObject.value?.color && statusObject.value.color.startsWith('#')) {
    // Calculer la couleur de texte (noir ou blanc selon la luminosité)
    const hex = statusObject.value.color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    const textColor = luminance > 0.5 ? '#1f2937' : '#ffffff'
    
    return {
      backgroundColor: statusObject.value.color,
      color: textColor,
    }
  }
  return {}
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  // Si une couleur hex est fournie, on utilise le style inline, pas les classes
  if (statusObject.value?.color && statusObject.value.color.startsWith('#')) {
    return baseClasses
  }
  
  // Sinon, utiliser la couleur par défaut selon le groupe ou la prop
  let colorToUse = props.color
  
  if (statusObject.value?.group && !props.color) {
    // Couleurs par défaut selon le groupe
    const groupColors: Record<StatusGroup, 'primary' | 'success' | 'warning' | 'danger' | 'gray'> = {
      [StatusGroupEnum.COMMERCIAL]: 'primary',
      [StatusGroupEnum.AUDIENCE]: 'success',
      [StatusGroupEnum.CONDITION]: 'warning',
      [StatusGroupEnum.LIFECYCLE]: 'danger',
    }
    colorToUse = groupColors[statusObject.value.group] || 'gray'
  }
  
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    gray: 'bg-gray-100 text-gray-800',
  }
  
  return `${baseClasses} ${colorClasses[colorToUse]}`
})
</script>
