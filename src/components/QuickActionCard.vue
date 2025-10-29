<template>
  <RouterLink
    :to="href"
    :class="[
      'card hover:shadow-md transition-shadow cursor-pointer group',
      colorClasses.border
    ]"
  >
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
        <div class="ml-4 flex-1">
          <h3 class="text-sm font-medium text-gray-900 group-hover:text-primary-600">
            {{ title }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ description }}
          </p>
        </div>
        <div class="flex-shrink-0">
          <ChevronRightIcon class="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRightIcon, PlusIcon, UserGroupIcon, CurrencyDollarIcon, QrCodeIcon } from '@heroicons/vue/24/outline'

interface Props {
  title: string
  description: string
  icon: string
  href: string
  color: 'primary' | 'success' | 'warning' | 'danger'
}

const props = defineProps<Props>()

// Icône dynamique
const iconComponent = computed(() => {
  const iconMap: Record<string, any> = {
    PlusIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    QrCodeIcon,
  }
  return iconMap[props.icon] || PlusIcon
})

// Classes de couleur
const colorClasses = computed(() => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      border: 'border-l-4 border-primary-500',
    },
    success: {
      bg: 'bg-success-100',
      text: 'text-success-600',
      border: 'border-l-4 border-success-500',
    },
    warning: {
      bg: 'bg-warning-100',
      text: 'text-warning-600',
      border: 'border-l-4 border-warning-500',
    },
    danger: {
      bg: 'bg-danger-100',
      text: 'text-danger-600',
      border: 'border-l-4 border-danger-500',
    },
  }
  return colorMap[props.color]
})
</script>
