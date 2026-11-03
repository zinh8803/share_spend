---
name: ShareSpend
description: Sổ chi tiêu cá nhân & chia tiền nhóm theo dải ảnh Photobooth 4 Khung
colors:
  ground: "#EDE6FF"
  paper: "#FFFFFF"
  ink: "#222222"
  ink-soft: "#55506A"
  line: "#DDD6EE"
  lilac: "#C9B6FF"
  lilac-deep: "#7A5CFF"
  sky: "#A8D8FF"
  blush: "#FFD6E2"
  butter: "#FFF1A8"
  pink: "#FF8FB1"
  pink-wash: "#FFF5F8"
  gain: "#0B7A4B"
  gain-bg: "#D4F5E3"
  loss: "#C2185B"
  loss-bg: "#FFE0EB"
typography:
  display:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
  strip-title:
    fontFamily: "Patrick Hand, Be Vietnam Pro, cursive"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.2
  hand:
    fontFamily: "Patrick Hand, Be Vietnam Pro, cursive"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  field-value:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  segment:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 600
    lineHeight: 1.3
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.3
  chip:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.2
  micro:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  inner: "4px"
  frame: "6px"
  field: "12px"
  tile: "14px"
  panel: "20px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  button-accent:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  card-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px 32px"
---

# Design System: ShareSpend

## Overview

**Creative North Star: "Photobooth 4 Khung"**

ShareSpend biến việc ghi chép chi tiêu và chia tiền nhóm thành những dải ảnh photobooth chụp cùng hội bạn. Mỗi nhóm là một dải ảnh giấy trắng viền mực đậm (`3px`), từng thành viên nằm trong một khung màu pastel riêng với nhân vật doodle từ thư viện mở, và phần công nợ được ghi chú bên cạnh bằng nét chữ viết tay.

Hệ thống từ chối giao diện kế toán xám lạnh hoặc bảng Splitwise truyền thống, đồng thời giữ độ rõ ràng tuyệt đối cho dữ liệu tài chính: số tiền luôn thẳng cột (`tabular-nums`), không bao giờ tràn ô, và toàn bộ nút bấm hay điều hướng đều là chữ thuần túy (không ghép icon vào trước chữ).

**Key Characteristics:**
- Dải ảnh Photobooth (`PhotoStrip`) nghiêng nhẹ (`-1.4deg` đến `1.2deg`) với viền chọn màu hồng (`6px`).
- Mọi bề mặt làm việc là tấm giấy in trắng (`#FFFFFF`) đặt trên nền tím lilac nhạt (`#EDE6FF`), đóng khung bằng nét mực đen (`3px solid #222222`).
- Minh họa dễ thương từ các thư viện mở (DiceBear Notionists, Open Peeps, Microsoft Fluent Emoji 3D) đứng độc lập như khung ảnh hoặc hình dán, không bao giờ dùng icon trang trí cho nhãn chữ.
- Hai màu hướng dòng tiền (xanh lá cho khoản nhận về, hồng đậm cho khoản phải trả) được khóa chặt cho ngữ nghĩa tài chính.

## Colors

Bảng màu kết hợp giấy in photobooth, các khung nền pastel tươi sáng của tiệm chụp ảnh Hàn Quốc, và cặp màu dòng tiền có độ tương phản cao.

### Primary
- **Booth Lilac** (`#C9B6FF`): Màu nhận diện chính cho trạng thái đang chọn trên thanh điều hướng, khung ảnh đầu tiên và điểm nhấn tương tác.
- **Deep Violet Focus** (`#7A5CFF`): Dùng cho vòng focus bàn phím, con trỏ nhập liệu và các dòng chú thích viết tay cần nhấn mạnh.
- **Selection Pink** (`#FF8FB1`): Viền chọn `6px` quanh dải ảnh photobooth đang mở và nút hành động tạo khoản chi phụ.

### Secondary
- **Sky Frame** (`#A8D8FF`): Nền khung ảnh thành viên thứ hai và ô thống kê tổng chi nhóm.
- **Blush Frame** (`#FFD6E2`): Nền khung ảnh thành viên thứ ba và ô thống kê khoản cần nhận.
- **Butter Frame** (`#FFF1A8`): Nền khung ảnh thành viên thứ tư, nút hành động phụ ("Thêm thu chi") và hộp ghi nhận thanh toán.

### Tertiary
- **Receivable Emerald** (`#0B7A4B`) trên nền **Mint Wash** (`#D4F5E3`): Dành riêng cho số tiền thu vào hoặc khoản người khác đang nợ bạn (`+125.000đ`).
- **Payable Rose** (`#C2185B`) trên nền **Rose Wash** (`#FFE0EB`): Dành riêng cho khoản chi ra, số tiền bạn đang nợ người khác (`−125.000đ`) và thông báo lỗi.

### Neutral
- **Lilac Wash Ground** (`#EDE6FF`): Nền tổng thể của toàn bộ trang web.
- **Print Paper** (`#FFFFFF`): Bề mặt của dải ảnh, bảng dữ liệu, thanh điều hướng và ô nhập liệu.
- **Marker Ink** (`#222222`): Màu chữ chính, viền khung `3px` và nút hành động chính.
- **Muted Slate** (`#55506A`): Màu chữ phụ và nhãn mô tả, đảm bảo tỷ lệ tương phản ≥ 4.5:1 trên cả nền trắng và nền lilac.
- **Dashed Rule** (`#DDD6EE`): Đường kẻ nét đứt ngăn cách các hàng giao dịch và công nợ.

### Named Rules
**The Money Direction Rule.** Xanh lá (`#0B7A4B`) và hồng đậm (`#C2185B`) chỉ xuất hiện khi biểu thị hướng tiền (thu về / chi ra / đang nợ) hoặc lỗi biểu mẫu; tuyệt đối không dùng hai màu này để trang trí.

## Typography

**Display & UI Font:** Be Vietnam Pro (400, 500, 600, 800)
**Handwritten Caption Font:** Patrick Hand (400)

**Character:** Be Vietnam Pro mang lại cấu trúc hình học rõ ràng, dấu tiếng Việt gọn và chữ số đều đặn ở độ đậm 800; Patrick Hand đóng vai trò nét bút ghi chú dưới đáy tấm ảnh photobooth.

### Hierarchy
- **Display** (800, `1.875rem`, line-height `1.15`): Tiêu đề màn hình và tên nhóm đang mở.
- **Headline** (800, `1.5rem`, line-height `1.2`): Số tiền tổng hợp trong các ô thống kê và tiêu đề khối.
- **Title** (700, `1.125rem`, line-height `1.3`): Tên khoản chi và tên thành viên.
- **Body** (400–600, `0.95rem`, line-height `1.5`): Nội dung bảng, nhãn biểu mẫu và mô tả.
- **Hand Caption** (400, `1.25rem`, line-height `1.2`): Chú thích dưới dải ảnh và ghi chú hóa đơn ("lẩu gà lá é tối qua").

### Named Rules
**The Tabular VND Rule.** Mọi con số tiền tệ, ngày tháng và phần trăm đều bật `font-variant-numeric: tabular-nums` và nằm trong vùng chứa có `min-w-0 overflow-hidden` để các hàng số thẳng cột và không bao giờ tràn khỏi khung.

**The Text-Only Label Rule.** Nhãn chữ trên nút bấm, thanh điều hướng, tiêu đề và thẻ trạng thái không bao giờ đi kèm icon phía trước hoặc phía sau.

## Layout

Khung trang chính giới hạn ở `1380px`, căn giữa với khoảng đệm ngang `16px` trên di động và `32px` trên màn hình lớn. Màn hình đầu tiên chia làm hai vùng bất đối xứng trên desktop (`xl:grid-cols-[auto_minmax(480px,1fr)]`): bên trái là 3 dải ảnh photobooth của các nhóm đang hoạt động, bên phải là bảng giấy trắng hiển thị chi tiết công nợ của nhóm đang chọn.

Các hàng dữ liệu sử dụng đường kẻ ngang nét đứt (`2px dashed #DDD6EE`) thay vì đóng khung từng thẻ con lồng nhau.

## Elevation & Depth

Bề mặt sử dụng độ sâu kiểu giấy in đặt trên bàn: viền mực đen dày (`2px` đến `3px`) kết hợp bóng đổ tím мяг (`box-shadow`) có độ lệch dọc và độ mờ nhẹ, tránh bóng cứng kiểu neobrutalism.

### Shadow Vocabulary
- **Resting Print** (`0 6px 18px -8px rgb(60 30 120 / 0.35)`): Độ nổi mặc định của mọi tấm `.panel` và dải ảnh `.PhotoStrip`.
- **Hover Lift** (`0 14px 30px -12px rgb(60 30 120 / 0.45)`): Khi di chuột vào nút bấm hoặc dải ảnh, phần tử nhấc lên `-2px` kèm bóng sâu hơn.

## Shapes

- **Khung ảnh trong dải (`4px`–`6px` radius):** Giữ góc vuông nhẹ đúng chất giấy ảnh cắt.
- **Ô nhập liệu & ô thống kê (`12px`–`14px` radius):** Bo vừa phải kèm viền `2px solid #222222`.
- **Bảng giấy lớn (`20px` radius):** Viền `3px solid #222222`.
- **Nút bấm, bộ chuyển tab & chip (`999px` pill radius):** Hình viên thuốc hoàn toàn để phân biệt rõ điều khiển tương tác với khung chứa dữ liệu.

## Components

### Buttons
- **Shape:** Viên thuốc (`999px`), viền `2px solid #222222`, chữ đậm `600`, không kèm icon.
- **Primary (`.btn-ink`):** Nền `#222222`, chữ `#FFFFFF`, padding `11px 20px`.
- **Secondary (`.btn`):** Nền `#FFFFFF` hoặc `#FFF1A8`, chữ `#222222`.
- **Hover / Focus:** Nhấc lên `-2px` với easing `cubic-bezier(0.16, 1, 0.3, 1)`; focus bàn phím hiển thị viền `#7A5CFF` dày `3px`.

### Chips
- **Style:** Viên thuốc nhỏ (`999px`), viền `1.5px solid #222222`, cỡ chữ `0.78rem` đậm `600`.
- **State:** Nền trắng hoặc pastel theo ngữ cảnh (danh mục, mã mời, trạng thái công nợ).

### Cards / Containers (`.panel`)
- **Corner Style:** Bo tròn `20px`.
- **Background:** Trắng giấy (`#FFFFFF`), hoặc pastel khi làm ô chỉ số.
- **Border:** `3px solid #222222`.
- **Internal Padding:** `24px` đến `32px`.

### Inputs / Fields (`.field`)
- **Style:** Viền `2px solid #222222`, nền `#FFFFFF`, bo góc `12px`, padding `11px 14px`.
- **Focus:** Vòng sáng `0 0 0 4px #C9B6FF`.
- **Error:** Viền `#C2185B` kèm vòng sáng `0 0 0 4px #FFE0EB` và dòng hướng dẫn sửa lỗi bên dưới.

### Navigation
- **Top Bar:** Cao `72px`, nền `#FFFFFF`, viền dưới `3px solid #222222`. Mục đang chọn mang nền viên thuốc `#C9B6FF`.
- **Segmented Switch (`.seg`):** Khung viên thuốc viền `2px solid #222222` chứa các nút chuyển tab nội bộ.

### Photobooth Strip (`PhotoStrip`)
- **Structure:** Khung giấy trắng rộng `172px`, viền `3px solid #222222`, xếp chồng tối đa 4 khung ảnh thành viên (cao `98px`, nền pastel, nhân vật DiceBear Notionists bên dưới, tên ở góc trái trên và số dư rút gọn ở góc phải trên), kết thúc bằng tiêu đề viết tay `Patrick Hand`.
- **Motion:** Hiệu ứng `.developing` làm từng khung ảnh hiện rõ dần từ trạng thái trắng sáng khi dải ảnh xuất hiện.

## Do's and Don'ts

### Do:
- **Do** dùng nhân vật minh họa từ DiceBear (`notionists`, `openPeeps`) và hình 3D Fluent Emoji như những tác phẩm hình ảnh độc lập trong khung ảnh hoặc ô danh mục.
- **Do** giữ viền mực `#222222` (`2px`–`3px`) nhất quán trên mọi bảng, khung ảnh và ô nhập liệu.
- **Do** hiển thị rõ cả hai con số "Đã trả hộ" và "Phần thực chịu" trên mọi màn hình nhóm và báo cáo.

### Don't:
- **Don't** gắn icon vào trước hoặc sau nhãn chữ trên nút bấm, menu điều hướng, tiêu đề hay thẻ chip.
- **Don't** lồng thẻ `.panel` có viền dày bên trong một `.panel` khác; hãy dùng ô màu nền hoặc đường kẻ nét đứt `.row-line`.
- **Don't** lưu trữ hoặc tính toán tiền VND bằng số thực dấu phẩy động (`float`).
