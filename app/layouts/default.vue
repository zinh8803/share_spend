<script setup lang="ts">
import { useAppStore } from '~/stores/app'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const publicPaths = ['/login', '/privacy', '/terms']
function isPublic(path: string) {
  return publicPaths.includes(path)
}

onMounted(async () => {
  await store.hydrate()
  if (store.hydrated && !store.loggedIn && !isPublic(route.path)) {
    router.replace('/login')
  }
})

watch(() => [store.hydrated, store.loggedIn, route.path], ([ready, logged, path]) => {
  if (ready && !logged && !isPublic(path as string)) {
    router.replace('/login')
  }
})

const navItems = [
  { to: '/', label: 'Tổng quan', exact: true },
  { to: '/transactions', label: 'Giao dịch' },
  { to: '/groups', label: 'Nhóm' },
  { to: '/reports', label: 'Báo cáo' },
  { to: '/categories', label: 'Danh mục' },
  { to: '/settings', label: 'Cài đặt' }
]

const defaultCreateExpenseLink = computed(() => {
  const firstActive = store.myGroups.find(g => g.status === 'active')
  return firstActive ? `/groups/${firstActive.id}/expenses/new` : '/groups'
})

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === '/'
  return route.path.startsWith(item.to)
}
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <header class="sticky top-0 z-30 bg-paper border-b-[3px] border-ink px-4 sm:px-8 h-[72px] flex items-center gap-3 sm:gap-6">
      <NuxtLink to="/" class="group flex items-center gap-2.5 font-extrabold text-xl sm:text-2xl tracking-tight text-ink mr-1 sm:mr-3">
        <BrandLogo :size="36" />
        <span>ShareSpend</span>
      </NuxtLink>

      <nav v-if="store.loggedIn" aria-label="Điều hướng chính" class="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-3.5 py-2 rounded-full text-sm sm:text-[15px] font-semibold text-ink whitespace-nowrap transition-colors"
          :class="isActive(item) ? 'bg-lilac' : 'hover:bg-ground'"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-2.5 shrink-0">
        <template v-if="store.loggedIn">
          <NuxtLink
            to="/transactions/new"
            class="hidden md:inline-flex btn btn-sm bg-butter"
          >
            Thêm thu chi
          </NuxtLink>
          <NuxtLink
            :to="defaultCreateExpenseLink"
            class="btn btn-sm sm:px-5 sm:py-2.5 btn-ink"
          >
            Tạo khoản chi
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="hidden sm:inline-flex items-center gap-2 pl-1"
            :aria-label="`Tài khoản ${store.me.name}`"
          >
            <PhotoAvatar :avatar="store.me.avatar" :seed="store.me.name" :bg="store.me.frame" :size="40" :label="store.me.name" />
          </NuxtLink>
        </template>
        <NuxtLink v-else to="/login" class="btn btn-sm btn-ink">
          Đăng nhập / Đăng ký
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <slot />
    </main>

    <footer class="border-t-2 border-dashed border-line px-4 sm:px-8 py-5 text-xs text-ink-soft flex flex-wrap items-center justify-between gap-4 max-w-[1380px] w-full mx-auto">
      <div class="flex flex-wrap items-center gap-2.5">
        <BrandLogo :size="22" />
        <span class="font-extrabold text-ink">ShareSpend</span>
        <span>· Sổ thu chi cá nhân & chia tiền nhóm</span>
        <span class="text-line">|</span>
        <NuxtLink to="/terms" class="hover:underline hover:text-ink font-semibold transition-colors">
          Chính sách sử dụng
        </NuxtLink>
        <span class="text-line">·</span>
        <NuxtLink to="/privacy" class="hover:underline hover:text-ink font-semibold transition-colors">
          Quyền riêng tư
        </NuxtLink>
      </div>
      <div v-if="store.loggedIn" class="flex items-center gap-4">
        <span>Đang đăng nhập: <strong>{{ store.me.name }}</strong> ({{ store.me.email }})</span>
      </div>
    </footer>
  </div>
</template>
