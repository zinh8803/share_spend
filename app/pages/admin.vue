<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore, type User } from '~/stores/app'

interface FeedbackItem {
  id: string
  userId: string | null
  email: string
  content: string
  status: 'pending' | 'read' | 'resolved'
  createdAt: string
  userName?: string | null
  userAvatar?: string | null
  userFrame?: string | null
}

const store = useAppStore()
const router = useRouter()

const activeTab = ref<'feedbacks' | 'users'>('feedbacks')
const statusFilter = ref<'all' | 'pending' | 'read' | 'resolved'>('all')

const feedbacks = ref<FeedbackItem[]>([])
const loadingFeedbacks = ref(false)
const feedbackActionLoading = ref<string | null>(null)
const userActionLoading = ref<string | null>(null)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const isAdmin = computed(() => store.hydrated && store.loggedIn && store.me.role === 'admin')

async function loadFeedbacks() {
  if (!isAdmin.value) return
  loadingFeedbacks.value = true
  try {
    const res = await $fetch<{ ok: boolean; feedbacks: FeedbackItem[] }>('/api/admin/feedbacks', {
      headers: store.getAuthHeaders()
    })
    if (res.ok) {
      feedbacks.value = res.feedbacks || []
    }
  } catch (err: any) {
    message.value = {
      type: 'error',
      text: err?.data?.statusMessage || err?.message || 'Không thể tải danh sách ý kiến đóng góp.'
    }
  } finally {
    loadingFeedbacks.value = false
  }
}

onMounted(async () => {
  if (!store.hydrated) {
    await store.hydrate()
  }
  if (isAdmin.value) {
    await loadFeedbacks()
  }
})

watch(() => isAdmin.value, (admin) => {
  if (admin) {
    loadFeedbacks()
  }
})

const filteredFeedbacks = computed(() => {
  if (statusFilter.value === 'all') return feedbacks.value
  return feedbacks.value.filter(f => f.status === statusFilter.value)
})

const pendingCount = computed(() => feedbacks.value.filter(f => f.status === 'pending').length)
const readCount = computed(() => feedbacks.value.filter(f => f.status === 'read').length)
const resolvedCount = computed(() => feedbacks.value.filter(f => f.status === 'resolved').length)

async function updateFeedbackStatus(id: string, newStatus: 'pending' | 'read' | 'resolved') {
  feedbackActionLoading.value = id
  message.value = null
  try {
    const res = await $fetch<{ ok: boolean; message: string }>('/api/admin/feedbacks', {
      method: 'POST',
      headers: store.getAuthHeaders(),
      body: {
        action: 'update_status',
        id,
        status: newStatus
      }
    })
    const item = feedbacks.value.find(f => f.id === id)
    if (item) {
      item.status = newStatus
    }
    message.value = { type: 'success', text: res.message || 'Cập nhật trạng thái thành công.' }
  } catch (err: any) {
    message.value = {
      type: 'error',
      text: err?.data?.statusMessage || err?.message || 'Không thể cập nhật trạng thái ý kiến.'
    }
  } finally {
    feedbackActionLoading.value = null
  }
}

async function deleteFeedback(id: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa ý kiến đóng góp này?')) return
  feedbackActionLoading.value = id
  message.value = null
  try {
    const res = await $fetch<{ ok: boolean; message: string }>('/api/admin/feedbacks', {
      method: 'POST',
      headers: store.getAuthHeaders(),
      body: {
        action: 'delete',
        id
      }
    })
    feedbacks.value = feedbacks.value.filter(f => f.id !== id)
    message.value = { type: 'success', text: res.message || 'Đã xóa ý kiến đóng góp.' }
  } catch (err: any) {
    message.value = {
      type: 'error',
      text: err?.data?.statusMessage || err?.message || 'Không thể xóa ý kiến đóng góp.'
    }
  } finally {
    feedbackActionLoading.value = null
  }
}

async function toggleUserRole(user: User) {
  const targetRole = user.role === 'admin' ? 'user' : 'admin'
  const actionText = targetRole === 'admin' ? 'nâng quyền Admin cho' : 'hạ quyền thành Viên đối với'
  if (!confirm(`Bạn có chắc muốn ${actionText} tài khoản "${user.name}" (${user.email})?`)) {
    return
  }

  userActionLoading.value = user.id
  message.value = null
  try {
    const res = await $fetch<{ ok: boolean; message: string }>('/api/admin/users', {
      method: 'POST',
      headers: store.getAuthHeaders(),
      body: {
        action: 'set_role',
        userId: user.id,
        role: targetRole
      }
    })
    // Update local store
    user.role = targetRole
    message.value = { type: 'success', text: res.message || 'Đã cập nhật vai trò người dùng.' }
  } catch (err: any) {
    message.value = {
      type: 'error',
      text: err?.data?.statusMessage || err?.message || 'Không thể thay đổi vai trò người dùng.'
    }
  } finally {
    userActionLoading.value = null
  }
}

function formatDate(iso: string) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (_) {
    return iso
  }
}

useHead({
  title: 'Trang Quản trị | ShareSpend'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Non-admin access denied panel -->
    <div v-if="store.hydrated && (!store.loggedIn || store.me.role !== 'admin')" class="panel p-8 sm:p-12 text-center max-w-xl mx-auto my-12 space-y-4">
      <span class="chip bg-butter font-bold uppercase tracking-wider text-xs">Khu vực hạn chế</span>
      <h1 class="text-2xl sm:text-3xl font-black text-ink">Quyền truy cập bị từ chối</h1>
      <p class="text-ink-soft text-sm sm:text-base leading-relaxed">
        Trang này chỉ dành riêng cho tài khoản có vai trò <strong>Admin (Quản trị viên)</strong>.
        Nếu bạn là quản trị viên hệ thống, vui lòng đăng nhập đúng tài khoản được cấp quyền.
      </p>
      <div class="pt-4 flex justify-center gap-3">
        <NuxtLink to="/" class="btn btn-ink font-semibold">
          Quay lại trang chủ
        </NuxtLink>
      </div>
    </div>

    <!-- Admin dashboard container -->
    <div v-else-if="isAdmin" class="space-y-6">
      <!-- Header Banner -->
      <div class="panel p-6 sm:p-8 bg-paper flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="chip bg-butter font-bold text-xs uppercase tracking-wider">Khu vực quản trị</span>
            <span class="chip bg-gain-bg text-gain font-bold text-xs">Admin đang hoạt động</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Trung tâm quản trị ShareSpend
          </h1>
          <p class="text-sm text-ink-soft mt-1">
            Quản lý tất cả phản hồi / ý kiến đóng góp từ người dùng và kiểm soát phân quyền tài khoản hệ thống.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="loadFeedbacks"
            class="btn btn-sm bg-paper hover:bg-ground font-semibold"
            :disabled="loadingFeedbacks"
          >
            {{ loadingFeedbacks ? 'Đang tải lại...' : 'Tải lại dữ liệu' }}
          </button>
        </div>
      </div>

      <!-- Feedback message notification -->
      <div
        v-if="message"
        class="p-4 rounded-2xl border-2 font-semibold text-sm flex items-center justify-between gap-4"
        :class="message.type === 'success' ? 'bg-gain-bg border-gain text-gain' : 'bg-loss-bg border-loss text-loss'"
      >
        <span>{{ message.text }}</span>
        <button type="button" @click="message = null" class="font-bold underline text-xs">
          Ẩn thông báo
        </button>
      </div>

      <!-- Navigation Tabs & Stats -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="seg">
          <button
            type="button"
            :aria-pressed="activeTab === 'feedbacks'"
            @click="activeTab = 'feedbacks'"
            class="font-bold"
          >
            Ý kiến đóng góp ({{ feedbacks.length }})
          </button>
          <button
            type="button"
            :aria-pressed="activeTab === 'users'"
            @click="activeTab = 'users'"
            class="font-bold"
          >
            Quản lý tài khoản ({{ store.users.length }})
          </button>
        </div>

        <!-- Quick counters for feedbacks -->
        <div v-if="activeTab === 'feedbacks'" class="flex items-center gap-2 text-xs font-bold">
          <span class="chip bg-butter">Chờ xử lý: {{ pendingCount }}</span>
          <span class="chip bg-sky">Đã đọc: {{ readCount }}</span>
          <span class="chip bg-gain-bg text-gain">Đã giải quyết: {{ resolvedCount }}</span>
        </div>
      </div>

      <!-- TAB 1: FEEDBACKS LIST -->
      <div v-if="activeTab === 'feedbacks'" class="space-y-4">
        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-ink-soft mr-1">Bộ lọc trạng thái:</span>
          <button
            type="button"
            @click="statusFilter = 'all'"
            class="chip font-bold transition-all cursor-pointer"
            :class="statusFilter === 'all' ? 'bg-ink text-white' : 'bg-paper text-ink hover:bg-ground'"
          >
            Tất cả ({{ feedbacks.length }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'pending'"
            class="chip font-bold transition-all cursor-pointer"
            :class="statusFilter === 'pending' ? 'bg-ink text-white' : 'bg-butter text-ink hover:brightness-95'"
          >
            Chờ xử lý ({{ pendingCount }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'read'"
            class="chip font-bold transition-all cursor-pointer"
            :class="statusFilter === 'read' ? 'bg-ink text-white' : 'bg-sky text-ink hover:brightness-95'"
          >
            Đã đọc ({{ readCount }})
          </button>
          <button
            type="button"
            @click="statusFilter = 'resolved'"
            class="chip font-bold transition-all cursor-pointer"
            :class="statusFilter === 'resolved' ? 'bg-ink text-white' : 'bg-gain-bg text-gain hover:brightness-95'"
          >
            Đã giải quyết ({{ resolvedCount }})
          </button>
        </div>

        <!-- Loading indicator -->
        <div v-if="loadingFeedbacks" class="panel p-8 text-center text-ink-soft font-semibold">
          Đang tải dữ liệu ý kiến đóng góp...
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredFeedbacks.length === 0" class="panel p-10 text-center space-y-2">
          <h3 class="text-lg font-bold text-ink">Chưa có ý kiến nào</h3>
          <p class="text-sm text-ink-soft">
            {{ statusFilter === 'all' ? 'Hiện chưa có ý kiến đóng góp nào từ người dùng.' : 'Không có ý kiến nào thuộc trạng thái này.' }}
          </p>
        </div>

        <!-- Feedbacks Grid / Cards -->
        <div v-else class="grid grid-cols-1 gap-4">
          <div
            v-for="item in filteredFeedbacks"
            :key="item.id"
            class="panel p-5 sm:p-6 bg-paper flex flex-col justify-between gap-4 transition-all"
          >
            <div class="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
              <div class="flex items-center gap-3">
                <PhotoAvatar
                  v-if="item.userName"
                  :avatar="item.userAvatar || 'boy-cool'"
                  :seed="item.userName"
                  :bg="item.userFrame || '#C9B6FF'"
                  :size="38"
                  :label="item.userName"
                />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-ink text-sm sm:text-base">
                      {{ item.userName || 'Người dùng ẩn danh' }}
                    </span>
                    <span v-if="item.userId" class="chip bg-lilac text-[10px] py-0.5 px-2 font-bold">
                      Đã có tài khoản
                    </span>
                  </div>
                  <div class="text-xs text-ink-soft">
                    Email liên hệ: <strong class="text-ink">{{ item.email }}</strong>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="chip font-bold text-xs"
                  :class="{
                    'bg-butter text-ink': item.status === 'pending',
                    'bg-sky text-ink': item.status === 'read',
                    'bg-gain-bg text-gain': item.status === 'resolved'
                  }"
                >
                  {{ item.status === 'pending' ? 'Chờ xử lý' : item.status === 'read' ? 'Đã đọc' : 'Đã giải quyết' }}
                </span>
                <span class="text-xs text-ink-soft num font-medium">
                  {{ formatDate(item.createdAt) }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="bg-ground/40 p-4 rounded-xl border border-line">
              <p class="text-sm sm:text-[15px] text-ink whitespace-pre-wrap leading-relaxed">
                {{ item.content }}
              </p>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-if="item.status !== 'read'"
                  type="button"
                  @click="updateFeedbackStatus(item.id, 'read')"
                  class="btn btn-sm bg-sky font-semibold"
                  :disabled="feedbackActionLoading === item.id"
                >
                  Đánh dấu đã đọc
                </button>
                <button
                  v-if="item.status !== 'resolved'"
                  type="button"
                  @click="updateFeedbackStatus(item.id, 'resolved')"
                  class="btn btn-sm bg-gain-bg text-gain font-semibold"
                  :disabled="feedbackActionLoading === item.id"
                >
                  Đánh dấu đã giải quyết
                </button>
                <button
                  v-if="item.status !== 'pending'"
                  type="button"
                  @click="updateFeedbackStatus(item.id, 'pending')"
                  class="btn btn-sm bg-butter font-semibold"
                  :disabled="feedbackActionLoading === item.id"
                >
                  Đặt lại chờ xử lý
                </button>
              </div>

              <div>
                <button
                  type="button"
                  @click="deleteFeedback(item.id)"
                  class="btn btn-sm bg-loss-bg text-loss font-semibold hover:brightness-95"
                  :disabled="feedbackActionLoading === item.id"
                >
                  Xóa ý kiến
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: USERS AND ROLES -->
      <div v-else-if="activeTab === 'users'" class="space-y-4">
        <div class="panel p-6 bg-paper">
          <div class="border-b-2 border-line pb-4 mb-4">
            <h2 class="text-lg sm:text-xl font-black text-ink">
              Danh sách người dùng & phân quyền hệ thống
            </h2>
            <p class="text-xs sm:text-sm text-ink-soft mt-1">
              Quản trị viên có toàn quyền truy cập trang quản trị và xem ý kiến đóng góp. Thành viên chỉ thao tác các tính năng cá nhân và nhóm.
            </p>
          </div>

          <div class="divide-y divide-line">
            <div
              v-for="user in store.users"
              :key="user.id"
              class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <PhotoAvatar
                  :avatar="user.avatar || 'boy-cool'"
                  :seed="user.name"
                  :bg="user.frame || '#C9B6FF'"
                  :size="44"
                  :label="user.name"
                />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-ink text-base">{{ user.name }}</span>
                    <span
                      class="chip font-bold text-xs"
                      :class="user.role === 'admin' ? 'bg-gain-bg text-gain' : 'bg-ground text-ink-soft'"
                    >
                      {{ user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên (User)' }}
                    </span>
                    <span v-if="user.id === store.me.id" class="chip bg-butter text-[11px] font-bold">
                      Chính bạn
                    </span>
                  </div>
                  <div class="text-xs sm:text-sm text-ink-soft">
                    Email: <span class="font-medium text-ink">{{ user.email }}</span>
                    <span class="text-line mx-2">|</span>
                    Mã ID: <span class="font-mono text-xs">{{ user.id }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="toggleUserRole(user)"
                  class="btn btn-sm font-bold"
                  :class="user.role === 'admin' ? 'bg-loss-bg text-loss hover:brightness-95' : 'bg-gain-bg text-gain hover:brightness-95'"
                  :disabled="userActionLoading === user.id"
                >
                  {{ userActionLoading === user.id ? 'Đang cập nhật...' : user.role === 'admin' ? 'Hạ xuống User' : 'Nâng lên Admin' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

