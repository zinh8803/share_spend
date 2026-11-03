<script setup lang="ts">
import { createAvatar } from '@dicebear/core'
import { notionists, openPeeps } from '@dicebear/collection'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  seed?: string
  avatar?: string
  bg?: string
  size?: number
  variant?: 'notionists' | 'peeps'
  label?: string
}>(), {
  seed: '',
  avatar: '',
  bg: '#C9B6FF',
  size: 52,
  variant: 'notionists'
})

const dataUri = computed(() => {
  const style = props.variant === 'peeps' ? openPeeps : notionists
  const effectiveSeed = props.avatar || props.seed || 'boy-cool'
  return createAvatar(style as any, {
    seed: effectiveSeed,
    size: props.size * 2,
    radius: 0
  }).toDataUri()
})
</script>

<template>
  <figure
    class="frame relative inline-flex shrink-0 flex-col items-center justify-end overflow-hidden border-[3px] border-ink rounded-[6px] select-none"
    :style="{ width: `${size}px`, height: `${size}px`, backgroundColor: bg }"
  >
    <img
      :src="dataUri"
      :alt="label ? `Ảnh minh họa của ${label}` : `Ảnh minh họa ${seed}`"
      class="h-[92%] w-[92%] object-contain object-bottom"
      loading="lazy"
    />
  </figure>
</template>

