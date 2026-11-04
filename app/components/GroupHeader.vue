<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const props = defineProps<{ groupId: string }>()
const store = useAppStore()
const group = computed(() => store.group(props.groupId))
const route = useRoute()
const { t } = useI18n()

const tabs = computed(() => [
  { to: `/groups/${props.groupId}`, label: t('nav.overview'), exact: true },
  { to: `/groups/${props.groupId}/expenses`, label: t('groups.expenses') },
  { to: `/groups/${props.groupId}/balances`, label: t('groups.balances') },
  { to: `/groups/${props.groupId}/settlements`, label: t('groups.settlements') },
  { to: `/groups/${props.groupId}/members`, label: t('groups.members') }
])

function isActive(tab: { to: string; exact?: boolean }) {
  if (tab.exact) return route.path === tab.to
  return route.path.startsWith(tab.to)
}

const copiedLink = ref(false)
async function shareLink() {
  if (typeof window === 'undefined' || !group.value) return
  const link = `${window.location.origin}/join?code=${encodeURIComponent(group.value.inviteCode)}`
  if (navigator.share) {
    try {
      await navigator.share({
        title: group.value.name,
        text: `Tham gia nhóm chi tiêu "${group.value.name}" trên ShareSpend:`,
        url: link
      })
      return
    } catch (_) {}
  }
  navigator.clipboard?.writeText(link)
  copiedLink.value = true
  setTimeout(() => { copiedLink.value = false }, 2000)
}
</script>

<template>
  <div v-if="group" class="flex flex-col gap-4 mb-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink to="/groups" class="text-sm font-semibold text-ink-soft hover:text-ink underline">
            {{ t('groups.groupList') }}
          </NuxtLink>
          <span class="text-ink-soft">/</span>
          <span class="chip" :style="{ backgroundColor: group.frame }">
            {{ t('groups.inviteCode') }} {{ group.inviteCode }}
          </span>
          <button
            type="button"
            class="chip hover:bg-lilac cursor-pointer transition-colors"
            title="Sao chép link mời nhóm"
            @click="shareLink"
          >
            {{ copiedLink ? t('groups.copiedLink') : t('groups.shareLink') }}
          </button>
          <span v-if="group.status === 'archived'" class="chip bg-butter">
            {{ t('groups.archivedViewOnly') }}
          </span>
        </div>
        <h1 class="text-3xl font-extrabold text-ink mt-2">{{ group.name }}</h1>
        <p class="text-ink-soft text-sm mt-0.5">{{ group.description }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <NuxtLink
          v-if="group.status === 'active'"
          :to="`/groups/${groupId}/expenses/new`"
          class="btn btn-ink"
        >
          {{ t('groups.createGroupBtn') }}
        </NuxtLink>
        <NuxtLink :to="`/groups/${groupId}/balances`" class="btn bg-butter">
          {{ t('groups.recordPayment') }}
        </NuxtLink>
      </div>
    </div>

    <nav aria-label="Điều hướng trong nhóm" class="seg self-start">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        :aria-current="isActive(tab) ? 'page' : undefined"
        :class="isActive(tab) ? 'bg-lilac' : ''"
      >
        {{ tab.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
