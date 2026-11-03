<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
}>(), {
  size: 36
})
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center shrink-0 rounded-[10px] border-2 border-ink bg-lilac transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105 shadow-[2px_2px_0px_#1F192F]"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      class="w-[84%] h-[84%]"
    >
      <!-- Top mini photo frame -->
      <rect x="12" y="10" width="76" height="36" rx="6" fill="#FFD6E2" stroke="#1F192F" stroke-width="4.5" />
      <!-- Eyes -->
      <circle cx="36" cy="26" r="3.5" fill="#1F192F" />
      <circle cx="64" cy="26" r="3.5" fill="#1F192F" />
      <!-- Smile -->
      <path d="M43 31 Q50 37 57 31" fill="none" stroke="#1F192F" stroke-width="3" stroke-linecap="round" />
      <!-- Blush -->
      <circle cx="28" cy="30" r="3" fill="#FF7597" opacity="0.8" />
      <circle cx="72" cy="30" r="3" fill="#FF7597" opacity="0.8" />

      <!-- Bottom mini photo frame -->
      <rect x="12" y="54" width="76" height="36" rx="6" fill="#FFF1A8" stroke="#1F192F" stroke-width="4.5" />
      <!-- Coin -->
      <circle cx="50" cy="72" r="11" fill="#FFE066" stroke="#1F192F" stroke-width="3.5" />
      <text x="50" y="76" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" fill="#1F192F" text-anchor="middle">đ</text>

      <!-- Sparkle on corner -->
      <path d="M82 4 Q82 10 88 10 Q82 10 82 16 Q82 10 76 10 Q82 10 82 4 Z" fill="#FF7597" stroke="#1F192F" stroke-width="1.8" />
    </svg>
  </div>
</template>

