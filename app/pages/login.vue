<script setup lang="ts">
import { useAppStore } from '~/stores/app'

useHead({
  title: 'Đăng nhập & Đăng ký · ShareSpend',
  meta: [
    { name: 'description', content: 'Đăng nhập hoặc tạo tài khoản ShareSpend để bắt đầu quản lý thu chi cá nhân và chia tiền nhóm cùng bạn bè.' }
  ]
})

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const mode = ref<'login' | 'register' | 'forgot'>('register')
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)
const forgotSent = ref(false)

const previewFriends = [
  { id: '1', name: 'Bạn', bg: '#C9B6FF', sub: 'Chủ nhóm' },
  { id: '2', name: 'Thành viên 2', bg: '#A8D8FF' },
  { id: '3', name: 'Thành viên 3', bg: '#FFD6E2' },
  { id: '4', name: 'Thành viên 4', bg: '#FFF1A8' }
]

async function submit() {
  error.value = ''
  if (!email.value.trim() || !email.value.includes('@')) {
    error.value = 'Nhập địa chỉ email hợp lệ có chứa ký tự @.'
    return
  }
  if (mode.value === 'forgot') {
    forgotSent.value = true
    return
  }
  if (!password.value || password.value.length < 4) {
    error.value = 'Mật khẩu cần tối thiểu 4 ký tự.'
    return
  }
  submitting.value = true
  try {
    if (mode.value === 'register') {
      if (!name.value.trim()) {
        error.value = 'Nhập tên hiển thị để bạn bè nhận ra trong dải ảnh nhóm.'
        return
      }
      await store.register(name.value.trim(), email.value.trim(), password.value)
    } else {
      await store.login(email.value.trim(), password.value)
    }
    const redirect = (typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/'))
      ? route.query.redirect
      : '/'
    router.push(redirect)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Không thể xác thực tài khoản.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 items-center max-w-4xl mx-auto py-4">
    <div class="hidden sm:flex justify-center">
      <PhotoStrip
        :slots="previewFriends"
        caption="ShareSpend"
        subcaption="Photobooth 4 Khung"
        :tilt="-2"
        selected
      />
    </div>

    <div class="panel p-6 sm:p-9 flex flex-col gap-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold">
            {{ mode === 'login' ? 'Đăng nhập vào ShareSpend' : mode === 'register' ? 'Tạo tài khoản mới' : 'Khôi phục mật khẩu' }}
          </h1>
          <p class="hand text-xl text-ink-soft mt-1">
            Tài khoản, giao dịch và nhóm của bạn được đồng bộ an toàn và bảo mật.
          </p>
        </div>
        <img src="/stickers/camera.png" alt="Máy ảnh" class="w-14 h-14 object-contain shrink-0" />
      </div>

      <div class="seg self-start" role="tablist" aria-label="Chế độ xác thực">
        <button type="button" :aria-pressed="mode === 'register'" @click="mode = 'register'; error = ''; forgotSent = false">
          Đăng ký
        </button>
        <button type="button" :aria-pressed="mode === 'login'" @click="mode = 'login'; error = ''; forgotSent = false">
          Đăng nhập
        </button>
        <button type="button" :aria-pressed="mode === 'forgot'" @click="mode = 'forgot'; error = ''; forgotSent = false">
          Quên mật khẩu
        </button>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div v-if="mode === 'register'">
          <label for="auth-name" class="field-label">Tên hiển thị</label>
          <input id="auth-name" v-model="name" type="text" class="field" placeholder="Nhập tên của bạn" />
        </div>

        <div>
          <label for="auth-email" class="field-label">Email</label>
          <input
            id="auth-email"
            v-model="email"
            type="email"
            class="field"
            :aria-invalid="!!error"
            placeholder="ban@domain.com"
          />
        </div>

        <div v-if="mode !== 'forgot'">
          <label for="auth-password" class="field-label">Mật khẩu</label>
          <input
            id="auth-password"
            v-model="password"
            type="password"
            class="field"
            placeholder="Tối thiểu 4 ký tự"
          />
        </div>

        <p v-if="error" role="alert" class="field-error">{{ error }}</p>
        <p v-if="forgotSent" role="status" class="rounded-xl border-2 border-ink bg-[var(--color-gain-bg)] p-3 text-sm font-semibold">
          Đã gửi hướng dẫn đặt lại mật khẩu tới {{ email }}.
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" class="btn btn-ink" :disabled="submitting">
            {{ submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Gửi link khôi phục' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
