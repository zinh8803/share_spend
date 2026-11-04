<script setup lang="ts">
import { createAvatar } from '@dicebear/core'
import { notionists } from '@dicebear/collection'
import { computed } from 'vue'

export interface StripSlot {
  id: string
  name: string
  bg: string
  sub?: string
  avatar?: string
}

const props = withDefaults(defineProps<{
  slots: StripSlot[]
  caption: string
  subcaption?: string
  selected?: boolean
  tilt?: number
  archived?: boolean
  compact?: boolean
}>(), {
  selected: false,
  tilt: -1.2,
  archived: false,
  compact: false
})

const emit = defineEmits<{ (e: 'select'): void }>()

const frames = computed(() => props.slots.slice(0, 4).map(s => ({
  ...s,
  avatar: createAvatar(notionists as any, { seed: s.avatar || s.name, size: 160 }).toDataUri()
})))

const extraCount = computed(() => Math.max(0, props.slots.length - 4))
const { t } = useI18n()
</script>

<template>
  <button
    type="button"
    class="developing group relative flex flex-col gap-2.5 bg-paper border-[3px] border-ink rounded-[6px] p-3 pb-4 text-left transition-transform duration-200 cursor-pointer shrink-0"
    :class="[
      selected ? 'outline-[6px] outline-pink shadow-[var(--shadow-lift)] z-10' : 'shadow-[var(--shadow-print)] hover:-translate-y-1',
      archived ? 'opacity-70 saturate-50' : '',
      compact ? 'w-[152px] min-w-[152px]' : 'w-[172px] min-w-[172px]'
    ]"
    :style="{ transform: `rotate(${tilt}deg)`, width: compact ? '152px' : '172px', minWidth: compact ? '152px' : '172px' }"
    @click="emit('select')"
  >
    <div
      v-for="(f, idx) in frames"
      :key="f.id"
      class="frame relative flex flex-col justify-between overflow-hidden rounded-[4px] border-2 border-ink p-2"
      :class="compact ? 'h-[82px]' : 'h-[98px]'"
      :style="{ backgroundColor: f.bg, animationDelay: `${idx * 90}ms` }"
    >
      <div class="flex items-center justify-between gap-1 z-10">
        <span class="rounded bg-paper/90 px-1.5 py-0.5 text-xs font-extrabold text-ink border border-ink">
          {{ f.name }}
        </span>
        <span v-if="f.sub" class="rounded bg-ink px-1.5 py-0.5 text-[11px] font-bold text-paper num">
          {{ f.sub }}
        </span>
      </div>
      <img
        :src="f.avatar"
        :alt="`Khung ảnh ${f.name}`"
        class="pointer-events-none absolute right-1 bottom-0 h-[82%] w-[78%] object-contain object-bottom"
      />
    </div>

    <div class="pt-1 text-center">
      <div class="hand text-[22px] leading-tight text-ink">
        {{ caption }}
      </div>
      <div v-if="subcaption" class="hand text-[16px] text-ink-soft leading-tight mt-0.5">
        {{ subcaption }}
      </div>
      <div v-if="extraCount > 0" class="mt-1 text-xs font-semibold text-ink-soft">
        {{ t('dashboard.andMore', { count: extraCount }) }}
      </div>
    </div>
  </button>
</template>

