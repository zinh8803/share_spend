<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: 'Chính sách quyền riêng tư · ShareSpend'
})
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-8 py-2">
    <div>
      <NuxtLink to="/" class="text-sm font-semibold underline text-ink-soft hover:text-ink">
        {{ t('common.back') }}
      </NuxtLink>
      <h1 class="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">Chính sách quyền riêng tư</h1>
      <p class="text-sm sm:text-base text-ink-soft mt-1.5">
        Cập nhật lần cuối: Tháng 11/2026 · Dữ liệu tài chính của bạn là của bạn. Chúng tôi bảo vệ nghiêm túc.
      </p>
    </div>

    <div class="panel p-6 sm:p-8 flex flex-col gap-6">
      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">1. Thông tin chúng tôi thu thập</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          ShareSpend chỉ thu thập những thông tin thực sự cần thiết để vận hành tài khoản và các tính năng tính toán:
        </p>
        <ul class="list-disc pl-5 text-sm space-y-1.5 text-ink/85">
          <li><strong>Thông tin tài khoản:</strong> Tên hiển thị, địa chỉ email, mật khẩu đã được băm bảo mật (SHA-256), màu khung ảnh và nhân vật đại diện.</li>
          <li><strong>Dữ liệu giao dịch:</strong> Các khoản thu nhập, chi tiêu cá nhân, hóa đơn nhóm và lịch sử đối soát hoàn tiền do bạn chủ động nhập.</li>
        </ul>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">2. Mục đích sử dụng dữ liệu</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          Thông tin của bạn được sử dụng duy nhất cho các mục đích sau:
        </p>
        <ul class="list-disc pl-5 text-sm space-y-1.5 text-ink/85">
          <li>Xác thực phiên làm việc và duy trì trạng thái đăng nhập an toàn.</li>
          <li>Tổng hợp số liệu thu chi, tính toán công nợ hai chiều giữa các thành viên trong nhóm.</li>
          <li>Vẽ biểu đồ phân tích danh mục chi tiêu trong mục Báo cáo tài chính.</li>
          <li><strong>Tuyệt đối không:</strong> Không bán, không cho thuê, không chia sẻ dữ liệu chi tiêu của bạn cho bất kỳ đối tác quảng cáo nào.</li>
        </ul>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">3. Bảo mật và lưu trữ</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          Dữ liệu được lưu trữ trên hệ thống cơ sở dữ liệu có kiểm soát truy cập nghiêm ngặt. Mật khẩu người dùng luôn được mã hóa một chiều kèm chuỗi muối bảo vệ (salt). Mọi kết nối truyền tải đều được cách ly an toàn.
        </p>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">4. Quyền kiểm soát của bạn</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          Bạn có toàn quyền kiểm soát dữ liệu của mình bất cứ lúc nào:
        </p>
        <ul class="list-disc pl-5 text-sm space-y-1.5 text-ink/85">
          <li>Tự do thay đổi tên hiển thị, email, nhân vật đại diện nam/nữ và màu khung photobooth trong trang Cài đặt.</li>
          <li>Chỉnh sửa hoặc xóa các giao dịch cá nhân và hóa đơn nhóm đã tạo.</li>
          <li>Đăng xuất tài khoản để xóa phiên lưu trữ trên trình duyệt.</li>
        </ul>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">5. Liên hệ</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          Nếu có bất kỳ câu hỏi nào về chính sách quyền riêng tư hoặc muốn yêu cầu hỗ trợ về dữ liệu, bạn có thể liên hệ đội ngũ quản trị qua email hỗ trợ của ShareSpend.
        </p>
      </section>

      <div class="pt-4 border-t-2 border-dashed border-line flex flex-wrap items-center justify-between gap-4">
        <NuxtLink to="/terms" class="btn">Xem Chính sách sử dụng</NuxtLink>
        <NuxtLink to="/" class="btn btn-ink">Về tổng quan</NuxtLink>
      </div>
    </div>
  </div>
</template>

