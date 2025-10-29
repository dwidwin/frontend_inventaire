<template>
  <div class="card">
    <div class="card-body">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div :class="[
            'p-3 rounded-md',
            colorClasses.bg,
            colorClasses.text
          ]">
            <component :is="iconComponent" class="h-6 w-6" />
          </div>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd class="text-lg font-medium text-gray-900">
              <div v-if="loading" class="skeleton h-6 w-16"></div>
              <span v-else>{{ formattedValue }}</span>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CubeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BellIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  title: string
  value: number
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger'
  loading?: boolean
}

const props = defineProps<Props>()

// Icône dynamique
const iconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    CubeIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    BellIcon,
  }
  return iconMap[props.icon] || CubeIcon
})

// Classes de couleur
const colorClasses = computed(() => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
    },
    success: {
      bg: 'bg-success-100',
      text: 'text-success-600',
    },
    warning: {
      bg: 'bg-warning-100',
      text: 'text-warning-600',
    },
    danger: {
      bg: 'bg-danger-100',
      text: 'text-danger-600',
    },
  }
  return colorMap[props.color]
})

// Valeur formatée
const formattedValue = computed(() => {
  if (props.value >= 1000000) {
    return `${(props.value / 1000000).toFixed(1)}M`
  }
  if (props.value >= 1000) {
    return `${(props.value / 1000).toFixed(1)}K`
  }
  return props.value.toLocaleString()
})
</script>
