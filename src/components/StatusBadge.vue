<template>
  <span :class="badgeClasses">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'gray'
})

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    gray: 'bg-gray-100 text-gray-800',
  }
  
  return `${baseClasses} ${colorClasses[props.color]}`
})
</script>
