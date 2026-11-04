<script setup lang="ts">
import { useAppStore } from '~/stores/app'

useHead({
  title: 'Lời mời tham gia nhóm chi tiêu · ShareSpend',
  meta: [
    { name: 'description', content: 'Xem trước và tham gia nhóm chi tiêu chung trên ShareSpend để cùng nhau chia sẻ chi phí du lịch, ăn uống minh bạch.' }
  ]
})

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const { t } = useI18n()

const codeInput = ref(String(route.query.code || '').trim().toUpperCase())
const loading = ref(false)
const error = ref('')
const joining = ref(false)
const inviteData = ref<any>(null)
const copied = ref(false)

const group = computed(() => inviteData.value?.group)

const isAlreadyMember = computed(() => {
  if (!store.loggedIn || !group.value) return false
  return store.members.some(m => m.groupId === group.value.id && m.userId === store.meId && m.status === 'active')
})

const stripSlots = computed(() => {
  if (!group.value) return []
  return (group.value.members || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    bg: m.frame,
    avatar: m.avatar
  }))
})

async function fetchInvite() {
  if (!codeInput.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>(`/api/invite?code=${encodeURIComponent(codeInput.value)}`)
    inviteData.value = res
  } catch (e: any) {
    inviteData.value = null
    error.value = e?.data?.statusMessage || e?.message || 'Không tìm thấy nhóm với mã mời này.'
  } finally {
    loading.value = false
  }
}

async function handleJoin() {
  if (!store.hydrated) {
    await store.hydrate()
  }

  if (!store.loggedIn) {
    const redirectPath = route.fullPath || `/join?code=${encodeURIComponent(codeInput.value)}`
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
    return
  }

  joining.value = true
  error.value = ''
  try {
    const res = await store.joinByCode(codeInput.value)
    if (!res.ok) {
      if (res.groupId) {
        await router.push(`/groups/${res.groupId}`)
        return
      }
      error.value = res.error || 'Không thể tham gia nhóm.'
      return
    }
    if (res.groupId) {
      await router.push(`/groups/${res.groupId}`)
    }
  } catch (e: any) {
    error.value = e?.message || 'Lỗi khi tham gia nhóm.'
  } finally {
    joining.value = false
  }
}

function copyInviteLink() {
  if (typeof window === 'undefined') return
  const link = window.location.href
  navigator.clipboard?.writeText(link)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

onMounted(async () => {
  if (!store.hydrated) {
    await store.hydrate()
  }
  if (codeInput.value) {
    fetchInvite()
  }
})

watch(() => route.query.code, (newCode) => {
  if (typeof newCode === 'string' && newCode.trim()) {
    codeInput.value = newCode.trim().toUpperCase()
    fetchInvite()
  }
})
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-8 py-4">
    <div>
      <NuxtLink to="/groups" class="text-sm font-semibold underline text-ink-soft hover:text-ink">
        {{ t('common.back') }}
      </NuxtLink>
      <h1 class="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
        {{ t('join.title') }}
      </h1>
      <p class="text-sm sm:text-base text-ink-soft mt-1">
        {{ t('join.subtitle') }}
      </p>
    </div>

    <!-- Group Preview Found -->
    <div v-if="group" class="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
      <div class="flex flex-col items-center gap-3">
        <PhotoStrip
          :slots="stripSlots"
          :caption="group.name"
          :subcaption="`${group.memberCount} ${t('dashboard.members')}`"
          :tilt="-1.5"
          selected
        />
        <button
          type="button"
          class="btn btn-sm"
          @click="copyInviteLink"
        >
          {{ copied ? t('join.copiedInvite') : t('join.copyInvite') }}
        </button>
      </div>

      <div class="panel p-6 sm:p-8 flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="chip bg-lilac">{{ t('groups.inviteCode') }} {{ group.inviteCode }}</span>
          <span class="text-xs font-semibold text-ink-soft">{{ t('dashboard.createdBy') }} {{ group.creatorName }}</span>
        </div>

        <div>
          <h2 class="text-2xl font-extrabold text-ink">{{ group.name }}</h2>
          <p v-if="group.description" class="text-sm text-ink-soft mt-1.5 leading-relaxed">
            {{ group.description }}
          </p>
        </div>

        <div class="p-4 rounded-[12px] bg-ground border-2 border-ink flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-ink-soft">{{ t('join.currentMembers') }}</div>
            <div class="text-xl font-extrabold num mt-0.5">{{ group.memberCount }} {{ t('dashboard.members') }}</div>
          </div>
          <span class="chip" :class="group.status === 'active' ? 'bg-[var(--color-gain-bg)]' : 'bg-butter'">
            {{ group.status === 'active' ? t('groups.activeFilter') : t('groups.archivedFilter') }}
          </span>
        </div>

        <p v-if="error" role="alert" class="field-error">{{ error }}</p>

        <!-- Actions -->
        <div class="pt-2 flex flex-col gap-3">
          <template v-if="!store.hydrated">
            <button
              type="button"
              class="btn btn-ink w-full text-center opacity-60 cursor-not-allowed"
              disabled
            >
              {{ t('common.loading') }}
            </button>
          </template>

          <template v-else-if="isAlreadyMember">
            <p class="gain text-sm font-semibold">
              {{ t('join.alreadyMember') }}
            </p>
            <NuxtLink :to="`/groups/${group.id}`" class="btn btn-ink text-center">
              {{ t('dashboard.openGroupDetails') }}
            </NuxtLink>
          </template>

          <template v-else-if="store.loggedIn">
            <button
              type="button"
              class="btn btn-ink w-full text-center"
              :disabled="joining || group.status === 'archived'"
              @click="handleJoin"
            >
              {{ joining ? t('join.joining') : t('join.joinNow') }}
            </button>
            <p class="text-xs text-ink-soft text-center">
              {{ t('footer.loggedInAs') }} <strong>{{ store.me.name }}</strong> ({{ store.me.email }})
            </p>
          </template>

          <template v-else>
            <button
              type="button"
              class="btn btn-ink w-full text-center"
              @click="handleJoin"
            >
              {{ t('join.loginToJoin') }}
            </button>
            <p class="text-xs text-ink-soft text-center">
              {{ t('join.loginHint') }}
            </p>
          </template>
        </div>
      </div>
    </div>

    <!-- Manual Code Input if not found or code missing -->
    <div v-else class="panel p-6 sm:p-8 flex flex-col gap-5 max-w-lg mx-auto w-full">
      <div>
        <h2 class="text-xl font-extrabold">{{ t('join.enterCodeTitle') }}</h2>
        <p class="text-sm text-ink-soft mt-1">
          {{ t('join.enterCodeDesc') }}
        </p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="fetchInvite">
        <div>
          <label for="inv-code" class="field-label">{{ t('groups.inviteCodeLabel') }}</label>
          <input
            id="inv-code"
            v-model="codeInput"
            type="text"
            class="field uppercase font-extrabold"
            placeholder="e.g. NHOM-ABCD"
          />
        </div>

        <p v-if="error" role="alert" class="field-error">{{ error }}</p>

        <div class="flex items-center gap-3 pt-1">
          <button type="submit" class="btn btn-ink" :disabled="loading || !codeInput.trim()">
            {{ loading ? t('common.loading') : t('join.checkCode') }}
          </button>
          <NuxtLink to="/groups" class="btn">{{ t('common.cancel') }}</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

