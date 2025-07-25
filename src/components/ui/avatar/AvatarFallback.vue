<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
})

const fallbackClass = computed(() => 
  cn(
    'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium',
    props.class
  )
)
</script>

<template>
  <span :class="fallbackClass">
    <slot />
  </span>
</template>
