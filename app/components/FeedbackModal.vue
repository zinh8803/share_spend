<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '~/stores/app'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const store = useAppStore()

const email = ref('')
const content = ref('')
const loading = ref(false)
const errorMsg = ref('')
const submitted = ref(false)

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (store.me?.email) {
      email.value = store.me.email
    }
    errorMsg.value = ''
    submitted.value = false
  }
})

function close() {
  emit('update:modelValue', false)
}

async function handleSubmit() {
  errorMsg.value = ''
  const trimmedEmail = email.value.trim()
  const trimmedContent = content.value.trim()

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    errorMsg.value = 'Vui lòng nhập địa chỉ email hợp lệ.'
    return
  }
  if (!trimmedContent || trimmedContent.length < 5) {
    errorMsg.value = 'Nội dung ý kiến cần có tối thiểu 5 ký tự.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      headers: store.getAuthHeaders(),
      body: {
        email: trimmedEmail,
        content: trimmedContent
      }
    })
    submitted.value = true
    content.value = ''
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || 'Có lỗi xảy ra khi gửi ý kiến. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

function handleReset() {
  submitted.value = false
  content.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs"
    @click.self="close"
  >
    <div
      class="panel max-w-lg w-full p-6 sm:p-8 bg-paper relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div class="flex items-start justify-between gap-4 border-b-2 border-line pb-4">
        <div>
          <span class="chip bg-lilac mb-1.5 text-xs font-bold uppercase tracking-wider">Hòm thư góp ý</span>
          <h2 id="feedback-title" class="text-xl sm:text-2xl font-black text-ink">
            Đóng góp ý kiến
          </h2>
          <p class="text-xs sm:text-sm text-ink-soft mt-1">
            Góp ý của bạn giúp ShareSpend ngày càng hoàn thiện và hữu ích hơn!
          </p>
        </div>
        <button
          type="button"
          @click="close"
          class="btn btn-sm btn-ghost font-bold text-ink-soft hover:text-ink px-2.5 py-1"
          aria-label="Đóng cửa sổ góp ý"
        >
          Đóng
        </button>
      </div>

      <div v-if="submitted" class="py-6 flex flex-col items-center text-center gap-4">
        <div class="w-16 h-16 rounded-full bg-gain-bg border-2 border-ink flex items-center justify-center font-black text-2xl text-gain">
          OK
        </div>
        <div>
          <h3 class="text-lg font-bold text-ink">Cảm ơn bạn rất nhiều!</h3>
          <p class="text-sm text-ink-soft mt-1 max-w-sm">
            Ý kiến của bạn đã được ghi nhận vào hệ thống. Đội ngũ ShareSpend sẽ xem xét và tiếp thu ngay.
          </p>
        </div>
        <div class="flex items-center gap-3 mt-2">
          <button
            type="button"
            @click="handleReset"
            class="btn btn-sm bg-butter"
          >
            Gửi thêm ý kiến
          </button>
          <button
            type="button"
            @click="close"
            class="btn btn-sm btn-ink"
          >
            Xong
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div>
          <label for="feedback-email" class="field-label">
            Email của bạn <span class="text-loss">*</span>
          </label>
          <input
            id="feedback-email"
            v-model="email"
            type="email"
            required
            placeholder="vd: ban@gmail.com"
            class="field"
            :disabled="loading"
          >
          <p class="text-[11px] text-ink-soft mt-1">
            Dùng để liên hệ trao đổi thêm hoặc cập nhật kết quả xử lý.
          </p>
        </div>

        <div>
          <label for="feedback-content" class="field-label">
            Nội dung đóng góp ý kiến <span class="text-loss">*</span>
          </label>
          <textarea
            id="feedback-content"
            v-model="content"
            required
            rows="5"
            placeholder="Chia sẻ ý kiến, trải nghiệm, báo lỗi hoặc tính năng bạn muốn có trên ShareSpend..."
            class="field resize-y"
            :disabled="loading"
          ></textarea>
        </div>

        <div v-if="errorMsg" class="p-3 bg-loss-bg border-2 border-loss rounded-xl text-xs font-semibold text-loss">
          {{ errorMsg }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-2 border-t-2 border-dashed border-line">
          <button
            type="button"
            @click="close"
            class="btn btn-sm btn-ghost font-semibold text-ink-soft"
            :disabled="loading"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="btn btn-sm btn-ink font-bold px-6"
            :disabled="loading"
          >
            {{ loading ? 'Đang gửi...' : 'Gửi ý kiến' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

