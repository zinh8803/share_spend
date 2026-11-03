<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const props = defineProps<{ groupId: string }>()
const store = useAppStore()
const group = computed(() => store.group(props.groupId))
const route = useRoute()

const tabs = computed(() => [
  { to: `/groups/${props.groupId}`, label: 'Tổng quan', exact: true },
  { to: `/groups/${props.groupId}/expenses`, label: 'Chi phí chung' },
  { to: `/groups/${props.groupId}/balances`, label: 'Công nợ' },
  { to: `/groups/${props.groupId}/settlements`, label: 'Thanh toán' },
  { to: `/groups/${props.groupId}/members`, label: 'Thành viên' }
])

function isActive(t: { to: string; exact?: boolean }) {
  if (t.exact) return route.path === t.to
  return route.path.startsWith(t.to)
}
</script>

<template>
  <div v-if="group" class="flex flex-col gap-4 mb-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink to="/groups" class="text-sm font-semibold text-ink-soft hover:text-ink underline">
            Danh sách nhóm
          </NuxtLink>
          <span class="text-ink-soft">/</span>
          <span class="chip" :style="{ backgroundColor: group.frame }">
            Mã mời: {{ group.inviteCode }}
          </span>
          <span v-if="group.status === 'archived'" class="chip bg-butter">
            Đã lưu trữ · chỉ xem
          </span>
        </div>
        <h1 class="text-3xl font-extrabold mt-2">{{ group.name }}</h1>
        <p class="text-ink-soft text-sm mt-0.5">{{ group.description }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <NuxtLink
          v-if="group.status === 'active'"
          :to="`/groups/${groupId}/expenses/new`"
          class="btn btn-ink"
        >
          Tạo khoản chi nhóm
        </NuxtLink>
        <NuxtLink :to="`/groups/${groupId}/balances`" class="btn bg-butter">
          Ghi nhận thanh toán
        </NuxtLink>
      </div>
    </div>

    <nav aria-label="Điều hướng trong nhóm" class="seg self-start">
      <NuxtLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        :aria-current="isActive(t) ? 'page' : undefined"
        :class="isActive(t) ? 'bg-lilac' : ''"
      >
        {{ t.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

