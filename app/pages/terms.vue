<script setup lang="ts">
useHead({
  title: 'Chính sách sử dụng · ShareSpend'
})
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-8 py-2">
    <div>
      <NuxtLink to="/" class="text-sm font-semibold underline text-ink-soft hover:text-ink">
        Quay lại trang chủ
      </NuxtLink>
      <h1 class="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">Chính sách & Điều khoản sử dụng</h1>
      <p class="text-sm sm:text-base text-ink-soft mt-1.5">
        Cập nhật lần cuối: Tháng 11/2026 · Nguyên tắc hoạt động minh bạch, dễ hiểu và công bằng.
      </p>
    </div>

    <div class="panel p-6 sm:p-8 flex flex-col gap-6">
      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">1. Giới thiệu về ShareSpend</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          ShareSpend là nền tảng ghi chép chi tiêu cá nhân và chia tiền nhóm hiện đại. Mục tiêu của ShareSpend là giúp bạn quản lý ngân sách cá nhân gọn gàng, chia sẻ hóa đơn nhóm công bằng và theo dõi công nợ ai nợ ai một cách rõ ràng, không gây khó xử giữa bạn bè, người thân hoặc đồng nghiệp.
        </p>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">2. Phạm vi và tính chất dịch vụ</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          ShareSpend là công cụ ghi chép, theo dõi và tính toán toán học. ShareSpend <strong>không phải là ngân hàng, ví điện tử hay đơn vị trung gian thanh toán</strong>. Các khoản tiền được hiển thị (VND) trên ứng dụng là dữ liệu ghi chép nội bộ giúp các thành viên đối chiếu. Việc chuyển tiền thực tế được thực hiện trực tiếp giữa các cá nhân qua tiền mặt hoặc tài khoản ngân hàng riêng.
        </p>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">3. Cơ chế tính toán chia tiền công bằng</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          Mọi hóa đơn và khoản chi trong nhóm đều áp dụng các thuật toán chia minh bạch (chia đều, chia theo số tiền thực tế, chia theo tỷ lệ phần trăm hoặc trọng số). Hệ thống đảm bảo tính bất biến: tổng số tiền các thành viên chịu luôn bằng chính xác tổng hóa đơn đã nhập, triệt tiêu sai số làm tròn.
        </p>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">4. Trách nhiệm của người sử dụng</h2>
        <ul class="list-disc pl-5 text-sm space-y-1.5 text-ink/85">
          <li>Cung cấp thông tin tên hiển thị và email hợp lệ để xác thực đăng nhập.</li>
          <li>Ghi chép số tiền và nội dung thu chi trung thực, tôn trọng thỏa thuận chung của nhóm.</li>
          <li>Tự bảo quản mật khẩu tài khoản và không chia sẻ phiên đăng nhập cho người không liên quan.</li>
        </ul>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-extrabold text-ink">5. Quyền sở hữu và thay đổi điều khoản</h2>
        <p class="text-sm leading-relaxed text-ink/85">
          ShareSpend có quyền cập nhật các điều khoản nhằm nâng cao chất lượng trải nghiệm và phù hợp với quy định pháp luật. Mọi thay đổi quan trọng sẽ được cập nhật công khai ngay tại trang này.
        </p>
      </section>

      <div class="pt-4 border-t-2 border-dashed border-line flex flex-wrap items-center justify-between gap-4">
        <NuxtLink to="/privacy" class="btn">Xem Chính sách quyền riêng tư</NuxtLink>
        <NuxtLink to="/" class="btn btn-ink">Về tổng quan</NuxtLink>
      </div>
    </div>
  </div>
</template>

