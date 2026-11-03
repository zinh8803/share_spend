<script setup lang="ts">
import { createAvatar } from '@dicebear/core'
import { openPeeps } from '@dicebear/collection'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  seed?: string
  title: string
  caption: string
  bg?: string
  sticker?: string
}>(), {
  seed: 'sharespend-happy',
  bg: '#FFF1A8'
})

const peepUri = computed(() =>
  createAvatar(openPeeps as any, { seed: props.seed, size: 260 }).toDataUri()
)
</script>

<template>
  <div class="panel flex flex-col items-center text-center p-7 gap-3 max-w-md mx-auto">
    <div
      class="relative flex items-end justify-center w-36 h-36 rounded-[10px] border-[3px] border-ink overflow-hidden"
      :style="{ backgroundColor: bg }"
    >
      <img :src="peepUri" :alt="title" class="w-32 h-32 object-contain object-bottom" />
      <img
        v-if="sticker"
        :src="`/stickers/${sticker}.png`"
        :alt="title"
        class="absolute top-2 right-2 w-10 h-10 object-contain"
      />
    </div>
    <h3 class="text-lg font-extrabold mt-1">{{ title }}</h3>
    <p class="hand text-xl text-ink-soft leading-snug">{{ caption }}</p>
    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </div>
</template>

