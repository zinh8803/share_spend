Cậu chủ đang có một ý tưởng khá tiềm năng để phát triển thành SaaS web. Điểm hay là sản phẩm có thể phục vụ đồng thời 3 nhóm khách hàng:
1. Nhóm bạn / gia đình: Chia tiền ăn uống, du lịch, mua sắm, tiền điện nước.
2. Công ty / nhóm làm việc: Theo dõi chi phí chung, tiền ăn trưa, liên hoan, công tác, quỹ nhóm.
3. Cá nhân: Ghi chép thu chi, theo dõi ngân sách, thống kê và phân tích thói quen chi tiêu.
Tôi đề xuất xây dựng sản phẩm theo hướng kết hợp giữa Expense Tracker + Group Expense Splitter.

Tên tạm thời: ShareSpend – Quản lý chi tiêu cá nhân và chia sẻ chi phí nhóm.

Dưới đây là tài liệu nghiệp vụ (Business Requirements Document – BRD) để cậu chủ có thể dùng làm cơ sở thiết kế database, API và triển khai MVP.
1. Tổng quan sản phẩm




















12













ShareSpend

Một nền tảng quản lý chi tiêu cho phép người dùng ghi nhận giao dịch cá nhân, quản lý chi phí chung, chia tiền giữa nhiều thành viên và theo dõi số tiền mỗi người cần thanh toán.

1.1. Mục tiêu
- Ghi nhận các khoản thu và chi cá nhân.
- Tạo nhóm để quản lý các khoản chi chung.
- Chia tiền tự động giữa các thành viên.
- Theo dõi ai đã trả tiền, ai còn nợ và ai cần nhận lại tiền.
- Tổng hợp báo cáo chi tiêu theo thời gian.
- Giảm việc tính toán thủ công trên Excel, Zalo hoặc nhóm chat.
1.2. Đối tượng sử dụng
Đối tượng	Nhu cầu
Cá nhân	Quản lý thu nhập và chi tiêu
Gia đình	Quản lý ngân sách và chi phí gia đình
Nhóm bạn	Chia tiền ăn uống, du lịch
Công ty	Quản lý chi phí nội bộ, quỹ nhóm
Nhóm thuê nhà	Chia tiền điện, nước, Internet, tiền thuê

2. Phân hệ nghiệp vụ
Tôi chia hệ thống thành 6 phân hệ chính.
01. Quản lý chi tiêu cá nhân

Ghi nhận thu nhập, chi tiêu, danh mục và ngân sách.

02. Quản lý nhóm

Tạo nhóm, mời thành viên, phân quyền và quản lý thành viên.

03. Quản lý chi phí chung

Tạo khoản chi, người thanh toán, người tham gia và cách chia tiền.

04. Công nợ và thanh toán

Tính toán số tiền cần trả, số tiền cần nhận và xác nhận thanh toán.

05. Thống kê và báo cáo

Biểu đồ thu chi cá nhân, nhóm, danh mục và thời gian.

06. Quản lý tài khoản và hệ thống

Tài khoản, cài đặt, thông báo và lịch sử hoạt động.

3. Chi tiết nghiệp vụ
3.1. Quản lý tài khoản
Actor: Người dùng.

Các chức năng:
- Đăng ký tài khoản bằng email và mật khẩu.
- Đăng nhập, đăng xuất.
- Quên mật khẩu.
- Cập nhật thông tin cá nhân.
- Cập nhật ảnh đại diện.
- Cấu hình tiền tệ mặc định (MVP ưu tiên VND).
- Cấu hình múi giờ.
Quy tắc nghiệp vụ:
- Email không được trùng.
- Người dùng chưa đăng nhập không được truy cập dữ liệu riêng tư.
- Một tài khoản có thể tham gia nhiều nhóm.
- Một tài khoản có thể vừa là chủ nhóm này, vừa là thành viên nhóm khác.
3.2. Quản lý chi tiêu cá nhân
Người dùng có thể ghi nhận các giao dịch thu và chi của riêng mình.

Thông tin giao dịch:
Trường	Mô tả
Transaction type	Income / Expense
Amount	Số tiền
Category	Danh mục
Description	Nội dung
Transaction date	Ngày giao dịch
Payment method	Tiền mặt / Chuyển khoản / Khác
Note	Ghi chú
Attachment	Hình ảnh hóa đơn (tùy chọn)

Ví dụ:
- Ăn sáng: 30.000đ.
- Ăn trưa: 50.000đ.
- Tiền lương: 12.000.000đ.
- Tiền điện thoại: 100.000đ.
- Tiền mua sắm: 500.000đ.
Danh mục mặc định:
Ăn uống

Ăn sáng, ăn trưa, cà phê...


Di chuyển

Xăng xe, taxi, gửi xe...


Nhà ở

Tiền thuê, điện, nước...


Mua sắm

Quần áo, đồ dùng...


Sức khỏe

Khám bệnh, thuốc...


Khác

Các khoản phát sinh...



Nghiệp vụ:
- Người dùng thêm, sửa, xóa giao dịch.
- Có thể lọc giao dịch theo ngày, tháng, năm, danh mục.
- Có thể tìm kiếm theo nội dung.
- Tự động tổng hợp tổng thu, tổng chi và số dư.
- Cho phép đặt ngân sách theo tháng và danh mục.
Công thức:
\[
Số\ dư = Tổng\ thu - Tổng\ chi
\]

Lưu ý: Chi phí nhóm không tự động được tính vào chi tiêu cá nhân để tránh tính trùng. Nếu người dùng muốn thống kê phần chi phí thực tế của mình, hệ thống sẽ lấy phần nghĩa vụ chi tiêu mà họ phải chịu trong nhóm.
3.3. Quản lý nhóm
Đây là một trong những nghiệp vụ quan trọng nhất của sản phẩm.

Người dùng có thể tạo nhiều nhóm khác nhau.

Ví dụ:
- Gia đình Vinh.
- Team Backend.
- Nhóm đi Đà Lạt.
- Nhóm thuê nhà.
- Team ăn trưa.
Thông tin nhóm:
Trường	Mô tả
Name	Tên nhóm
Description	Mô tả
Avatar	Ảnh nhóm
Group type	Family / Friends / Company / Other
Currency	Đơn vị tiền tệ
Created by	Người tạo
Status	Active / Archived

Vai trò trong nhóm:
Role	Quyền
Owner	Toàn quyền quản lý nhóm
Admin	Quản lý thành viên và chi phí
Member	Tạo chi phí, xem dữ liệu nhóm

MVP có thể bắt đầu với Owner và Member để giảm độ phức tạp.

Quy trình tạo nhóm:
1. Người dùng chọn tạo nhóm.
2. Nhập tên nhóm và mô tả.
3. Hệ thống tạo nhóm và gán Owner.
4. Owner gửi link hoặc mã mời cho thành viên.
5. Thành viên đăng nhập và tham gia nhóm.
6. Hệ thống cập nhật danh sách thành viên.

Quy tắc:
- Một người có thể tham gia nhiều nhóm.
- Không thể thêm cùng một tài khoản hai lần vào một nhóm.
- Owner không thể rời nhóm khi chưa chuyển quyền sở hữu.
- Khi xóa thành viên, lịch sử giao dịch cũ vẫn phải được giữ lại.
- Người ngoài nhóm không được xem dữ liệu nhóm.
3.4. Quản lý chi phí chung – nghiệp vụ cốt lõi
Đây là tính năng quan trọng nhất.

Người dùng có thể tạo một khoản chi chung và xác định ai là người thanh toán, những ai phải chịu khoản chi đó.

Ví dụ thực tế:

Một nhóm 4 người đi ăn tối:
- Vinh thanh toán: 500.000đ.
- An tham gia.
- Bình tham gia.
- Cường tham gia.
Chia đều 4 người:
\[
500.000 / 4 = 125.000đ
\]

Chi phí: Ăn tối
Tổng hóa đơn
500.000đ


V

Vinh

+375.000đ
Đã trả 500.000đ · Phần chịu 125.000đ

A

An

−125.000đ

B

Bình

−125.000đ

C

Cường

−125.000đ


Vinh cần nhận
375.000đ

Đây là số tiền 3 thành viên còn phải hoàn trả cho Vinh.
Các phương thức chia tiền
Tôi đề xuất hỗ trợ 4 phương thức:

1. Chia đều (Equal Split)

Tổng tiền chia đều cho các thành viên được chọn.

Ví dụ: 600.000đ / 3 người = 200.000đ/người.

2. Chia theo số tiền tùy chỉnh (Exact Amount)

Người tạo tự nhập số tiền từng người phải chịu.

Ví dụ:
Thành viên	Số tiền
Vinh	100.000đ
An	200.000đ
Bình	300.000đ
Tổng	600.000đ

3. Chia theo tỷ lệ (Percentage Split)

Ví dụ hóa đơn 1.000.000đ:
- Vinh: 50%.
- An: 30%.
- Bình: 20%.
4. Chia theo trọng số (Shares Split)

Ví dụ:
- Vinh: 2 phần.
- An: 1 phần.
- Bình: 1 phần.
Tổng 4 phần, hóa đơn 400.000đ thì mỗi phần 100.000đ.
Quy trình tạo chi phí
1. Nhập thông tin chi phí
   
   Tên chi phí, số tiền, danh mục, ngày giao dịch và ghi chú.
2. Chọn người thanh toán
   
   Người thanh toán có thể là một thành viên trong nhóm.
3. Chọn thành viên chịu chi phí
   
   Có thể chọn tất cả hoặc một số thành viên.
4. Chọn cách chia tiền
   
   Equal / Exact / Percentage / Shares.
5. Xác nhận chi phí
   
   Backend kiểm tra tổng số tiền phân bổ phải bằng tổng hóa đơn.
6. Cập nhật công nợ
   
   Tính số tiền mỗi người cần trả hoặc nhận.

Các quy tắc nghiệp vụ quan trọng:
- Tổng số tiền các thành viên chịu phải bằng tổng chi phí.
- Người thanh toán mặc định cũng là người chịu chi phí, nhưng có thể chỉnh sửa.
- Người không được chọn tham gia không phải chịu chi phí.
- Một chi phí có thể có nhiều người thanh toán (nên để phiên bản sau).
- Không cho phép sửa chi phí đã xóa hoặc đã lưu trữ.
- Khi sửa chi phí, hệ thống phải tính lại công nợ.
- Không xóa dữ liệu thanh toán đã phát sinh một cách âm thầm.
3.5. Quản lý công nợ và thanh toán
Hệ thống cần biết:
- Ai đang nợ tiền?
- Ai cần nhận tiền?
- Nợ bao nhiêu?
- Đã thanh toán chưa?
- Còn lại bao nhiêu?
Ví dụ:
Người nợ	Người nhận	Số tiền
An	Vinh	125.000đ
Bình	Vinh	125.000đ
Cường	Vinh	125.000đ

Nghiệp vụ thanh toán:
1. Người nợ mở danh sách công nợ.
2. Chọn khoản cần thanh toán.
3. Ghi nhận số tiền đã trả.
4. Người nhận xác nhận hoặc hệ thống ghi nhận theo quy tắc thanh toán của nhóm.
5. Cập nhật trạng thái công nợ.
Trạng thái:
- Pending: Chưa thanh toán.
- Partially Paid: Thanh toán một phần.
- Paid: Đã thanh toán.
- Cancelled: Đã hủy theo nghiệp vụ hợp lệ.
MVP nên có tính năng xác nhận thanh toán thủ công. Chưa cần tích hợp ngân hàng hoặc QR thanh toán tự động.
Tối ưu công nợ
Đây là tính năng đáng cân nhắc.

Ví dụ:
- An nợ Vinh 100.000đ.
- Bình nợ Vinh 100.000đ.
- Vinh nợ Cường 50.000đ.
Thay vì tạo nhiều giao dịch, hệ thống có thể tính toán công nợ ròng và đề xuất phương án thanh toán ít giao dịch hơn.

Lưu ý: Đây là số dư ròng của cả nhóm, không nhất thiết là khoản nợ trực tiếp từ hóa đơn cụ thể. Nên triển khai sau khi MVP đã ổn định.
3.6. Thống kê và báo cáo
Có 2 loại báo cáo chính.

A. Báo cáo cá nhân







dribbble.com


Các chỉ số:
- Tổng thu nhập.
- Tổng chi tiêu.
- Số dư.
- Chi tiêu theo danh mục.
- Chi tiêu theo ngày / tuần / tháng / năm.
- So sánh chi tiêu giữa các tháng.
- Danh mục chi tiêu nhiều nhất.
B. Báo cáo nhóm







ledgerapp.team


Các chỉ số:
- Tổng chi phí nhóm.
- Tổng số tiền đã thanh toán.
- Tổng công nợ chưa thanh toán.
- Thành viên chi nhiều nhất.
- Thành viên đang nợ nhiều nhất.
- Chi phí theo danh mục.
- Chi phí theo thời gian.
4. Luồng nghiệp vụ tổng thể
Đây là luồng sử dụng chính của hệ thống:
#chatgpt-mermaid-_r_1dr_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1dr_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1dr_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1dr_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1dr_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1dr_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1dr_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1dr_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1dr_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1dr_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1dr_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1dr_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1dr_ p{margin:0;}#chatgpt-mermaid-_r_1dr_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1dr_ .label text,#chatgpt-mermaid-_r_1dr_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ .node rect,#chatgpt-mermaid-_r_1dr_ .node circle,#chatgpt-mermaid-_r_1dr_ .node ellipse,#chatgpt-mermaid-_r_1dr_ .node polygon,#chatgpt-mermaid-_r_1dr_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .rough-node .label text,#chatgpt-mermaid-_r_1dr_ .node .label text,#chatgpt-mermaid-_r_1dr_ .image-shape .label,#chatgpt-mermaid-_r_1dr_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1dr_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .rough-node .label,#chatgpt-mermaid-_r_1dr_ .node .label,#chatgpt-mermaid-_r_1dr_ .image-shape .label,#chatgpt-mermaid-_r_1dr_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1dr_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1dr_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1dr_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1dr_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1dr_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1dr_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1dr_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1dr_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1dr_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1dr_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1dr_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1dr_ .icon-shape,#chatgpt-mermaid-_r_1dr_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1dr_ .icon-shape p,#chatgpt-mermaid-_r_1dr_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1dr_ .icon-shape .label rect,#chatgpt-mermaid-_r_1dr_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1dr_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1dr_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1dr_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1dr_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1dr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1dr_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1dr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1dr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1dr_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1dr_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1dr_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1dr_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1dr_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1dr_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1dr_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .node rect,#chatgpt-mermaid-_r_1dr_ .node circle,#chatgpt-mermaid-_r_1dr_ .node ellipse,#chatgpt-mermaid-_r_1dr_ .node polygon,#chatgpt-mermaid-_r_1dr_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1dr_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1dr_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1dr_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1dr_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1dr_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Đăng ký / Đăng nhậpDashboardQuản lý cá nhânQuản lý nhómThêm thu / chiThống kê cá nhânTạo nhóm / Tham gia nhómQuản lý thành viênTạo chi phí chungChọn người thanh toánChọn người chịu chi phíChọn cách chia tiềnTính công nợGhi nhận thanh toánBáo cáo nhóm





5. Đề xuất database cho MVP
Tôi đề xuất thiết kế theo hướng tách dữ liệu cá nhân và nhóm, nhưng dùng chung một số bảng giao dịch và danh mục.
5.1. Các bảng chính
Bảng	Chức năng
users	Tài khoản người dùng
groups	Thông tin nhóm
group_members	Thành viên và quyền
invitations	Mã/link mời tham gia
categories	Danh mục thu chi
transactions	Giao dịch cá nhân
expenses	Khoản chi chung
expense_payers	Người thanh toán
expense_splits	Phần chi phí mỗi thành viên chịu
settlements	Giao dịch hoàn trả
budgets	Ngân sách cá nhân
notifications	Thông báo
activity_logs	Lịch sử hoạt động

5.2. Quan hệ database
#chatgpt-mermaid-_r_1e8_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1e8_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1e8_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1e8_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1e8_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1e8_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1e8_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1e8_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1e8_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1e8_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1e8_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1e8_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1e8_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1e8_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1e8_ p{margin:0;}#chatgpt-mermaid-_r_1e8_ .entityBox{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1e8_ .relationshipLabelBox{fill:rgb(48, 48, 48);opacity:0.7;background-color:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1e8_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-_r_1e8_ .labelBkg{background-color:rgba(48, 48, 48, 0.5);}#chatgpt-mermaid-_r_1e8_ .edgeLabel{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1e8_ .edgeLabel .label rect{fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1e8_ .edgeLabel .label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1e8_ .edgeLabel .label{fill:rgb(31, 78, 148);font-size:14px;}#chatgpt-mermaid-_r_1e8_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1e8_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-_r_1e8_ .node rect,#chatgpt-mermaid-_r_1e8_ .node circle,#chatgpt-mermaid-_r_1e8_ .node ellipse,#chatgpt-mermaid-_r_1e8_ .node polygon{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1e8_ .relationshipLine{stroke:rgb(175, 175, 175);stroke-width:1px;fill:none;}#chatgpt-mermaid-_r_1e8_ .marker{fill:none!important;stroke:rgb(175, 175, 175)!important;stroke-width:1;}#chatgpt-mermaid-_r_1e8_ [data-look=neo].labelBkg{background-color:rgba(48, 48, 48, 0.5);}#chatgpt-mermaid-_r_1e8_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1e8_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1e8_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1e8_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1e8_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1e8_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1e8_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1e8_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1e8_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}USERSTRANSACTIONSGROUP_MEMBERSGROUPSEXPENSESEXPENSE_PAYERSEXPENSE_SPLITSSETTLEMENTSCATEGORIESownsjoinscontainshascreateshaspaysdividesowestracksparticipatescategorizescategorizes





5.3. Một số lưu ý thiết kế database
expenses
- id
- group_id
- created_by
- category_id
- title
- total_amount
- split_type
- expense_date
- description
- status
- created_at
- updated_at
expense_payers
- id
- expense_id
- user_id
- paid_amount
expense_splits
- id
- expense_id
- user_id
- share_amount
- share_value
- created_at
settlements
- id
- group_id
- from_user_id
- to_user_id
- amount
- paid_at
- status
- note
Lưu ý kỹ thuật:
- Dùng DECIMAL hoặc số nguyên theo đơn vị tiền tệ nhỏ nhất phù hợp, không dùng FLOAT để tính tiền.
- Khi tạo expense và các expense_splits phải sử dụng database transaction.
- Tính toán công nợ từ dữ liệu chi phí và thanh toán, không nên lưu một số dư có thể bị lệch với dữ liệu gốc.
- Khi sửa hoặc xóa chi phí phải cập nhật lại công nợ chính xác.
- Cần lưu snapshot thông tin giao dịch để giữ lịch sử khi thành viên đổi tên hoặc rời nhóm.
6. Phạm vi MVP – Nên làm gì trước?
Tôi khuyên cậu chủ không nên triển khai toàn bộ nghiệp vụ ngay từ đầu. Nên chia thành 3 giai đoạn.
Phase 1 – MVP
Ưu tiên triển khai

Mục tiêu: Có thể sử dụng thực tế và kiểm chứng nhu cầu.
- [ ] Đăng ký / đăng nhập.
- [ ] Dashboard cá nhân.
- [ ] Thêm / sửa / xóa thu chi cá nhân.
- [ ] Quản lý danh mục.
- [ ] Tạo và tham gia nhóm bằng mã mời.
- [ ] Quản lý thành viên.
- [ ] Tạo khoản chi chung.
- [ ] Chia đều và chia số tiền tùy chỉnh.
- [ ] Tự động tính công nợ.
- [ ] Xác nhận thanh toán thủ công.
- [ ] Báo cáo thu chi cơ bản.

Phase 2 – Nâng cấp
- [ ] Chia theo tỷ lệ và trọng số.
- [ ] Tối ưu công nợ.
- [ ] Ngân sách cá nhân.
- [ ] Upload hóa đơn.
- [ ] Thông báo khi có chi phí mới.
- [ ] Export Excel / CSV.
- [ ] Báo cáo nâng cao.
- [ ] Lịch sử chỉnh sửa giao dịch.

Phase 3 – Monetization
- [ ] Tích hợp QR thanh toán.
- [ ] Tích hợp ngân hàng nếu có điều kiện.
- [ ] Nhóm công ty và phân quyền nâng cao.
- [ ] Báo cáo tài chính cho nhóm.
- [ ] Giao dịch định kỳ.
- [ ] Gói Premium.

7. Danh sách màn hình giao diện
MVP nên có những màn hình sau:
Màn hình	Chức năng
Login / Register	Đăng nhập, đăng ký
Dashboard	Tổng quan thu chi
Transactions	Danh sách giao dịch cá nhân
Create Transaction	Thêm thu chi
Categories	Quản lý danh mục
Groups	Danh sách nhóm
Group Detail	Tổng quan nhóm
Members	Thành viên nhóm
Expenses	Danh sách chi phí nhóm
Create Expense	Tạo chi phí và chia tiền
Expense Detail	Chi tiết hóa đơn và phân bổ
Balances	Ai nợ ai
Settlements	Lịch sử thanh toán
Reports	Báo cáo thống kê
Settings	Cài đặt tài khoản

8. Một số tình huống nghiệp vụ cần xử lý
Đây là phần rất quan trọng để tránh lỗi khi đưa sản phẩm vào sử dụng.
Tình huống	Cách xử lý
Thành viên rời nhóm	Giữ nguyên dữ liệu và công nợ cũ
Thành viên bị xóa	Không xóa lịch sử giao dịch
Sửa chi phí	Tính lại phần chia và công nợ
Xóa chi phí	Hủy ảnh hưởng công nợ, lưu lịch sử
Thanh toán một phần	Giảm số dư còn phải trả
Chia tiền bị lệch vài đồng	Phân bổ phần dư theo quy tắc làm tròn nhất quán
Người thanh toán cũng chịu chi phí	Chỉ tính phần chênh lệch phải nhận
Người tạo chi phí không phải người thanh toán	Vẫn cho phép
Nhóm bị lưu trữ	Chỉ xem lịch sử, không thêm giao dịch mới

Một quy tắc đặc biệt cần nhớ: Tổng số tiền thành viên chịu phải bằng tổng hóa đơn, kể cả trường hợp chia phần trăm hoặc chia đều bị lẻ. Đây là invariant quan trọng của nghiệp vụ.
9. Đề xuất công nghệ
Với định hướng backend PHP/Laravel và có thể mở rộng Node.js sau này, tôi đề xuất:
Thành phần	Công nghệ
Backend	Laravel
Frontend	Nuxt 3 hoặc Vue 3
Database	MySQL
Cache	Redis (chưa bắt buộc ở MVP)
Authentication	Laravel Sanctum
API	RESTful API
UI	Tailwind CSS
Chart	Apache ECharts
Deployment	VPS Ubuntu + Nginx

Kiến trúc MVP:
#chatgpt-mermaid-_r_1fa_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1fa_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1fa_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1fa_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1fa_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1fa_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1fa_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1fa_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1fa_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1fa_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1fa_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1fa_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1fa_ p{margin:0;}#chatgpt-mermaid-_r_1fa_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1fa_ .label text,#chatgpt-mermaid-_r_1fa_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ .node rect,#chatgpt-mermaid-_r_1fa_ .node circle,#chatgpt-mermaid-_r_1fa_ .node ellipse,#chatgpt-mermaid-_r_1fa_ .node polygon,#chatgpt-mermaid-_r_1fa_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .rough-node .label text,#chatgpt-mermaid-_r_1fa_ .node .label text,#chatgpt-mermaid-_r_1fa_ .image-shape .label,#chatgpt-mermaid-_r_1fa_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1fa_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .rough-node .label,#chatgpt-mermaid-_r_1fa_ .node .label,#chatgpt-mermaid-_r_1fa_ .image-shape .label,#chatgpt-mermaid-_r_1fa_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1fa_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1fa_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1fa_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1fa_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1fa_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1fa_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1fa_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1fa_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1fa_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1fa_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1fa_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1fa_ .icon-shape,#chatgpt-mermaid-_r_1fa_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1fa_ .icon-shape p,#chatgpt-mermaid-_r_1fa_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1fa_ .icon-shape .label rect,#chatgpt-mermaid-_r_1fa_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1fa_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1fa_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1fa_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1fa_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1fa_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1fa_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1fa_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1fa_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1fa_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1fa_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1fa_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1fa_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1fa_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1fa_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1fa_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .node rect,#chatgpt-mermaid-_r_1fa_ .node circle,#chatgpt-mermaid-_r_1fa_ .node ellipse,#chatgpt-mermaid-_r_1fa_ .node polygon,#chatgpt-mermaid-_r_1fa_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1fa_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1fa_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1fa_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1fa_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1fa_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Web BrowserNuxt / Vue FrontendLaravel REST APIAuthenticationPersonal Expense ModuleGroup Expense ModuleExpense Split EngineSettlement ModuleReport ModuleMySQL





10. Định hướng kiếm tiền
Sản phẩm có thể triển khai mô hình Freemium.
Tính năng	Free	Premium
Quản lý thu chi cá nhân	✓	✓
Tạo nhóm	3 nhóm	Không giới hạn
Chia tiền cơ bản	✓	✓
Thống kê cơ bản	✓	✓
Export Excel	-	✓
Báo cáo nâng cao	-	✓
Upload hóa đơn	Giới hạn	✓
Ngân sách nâng cao	-	✓
Lịch sử dài hạn	Giới hạn	✓

Đây chỉ là mô hình đề xuất, chưa phải mức giá hay chính sách đã được kiểm chứng thị trường.

11. Những quyết định sản phẩm cần chốt trước khi code
Tôi có 3 đề xuất quan trọng:

Thứ nhất: Không nên chỉ làm ứng dụng chia tiền nhóm.

Nên kết hợp quản lý thu chi cá nhân và nhóm ngay từ đầu. Đây là điểm giúp người dùng có lý do quay lại sử dụng hàng ngày, thay vì chỉ mở web khi đi ăn hoặc đi du lịch.

Thứ hai: Không nên đồng nhất tiền đã trả và tiền phải chịu.

Ví dụ Vinh thanh toán 500.000đ nhưng chỉ phải chịu 125.000đ. Chi tiêu thực tế của Vinh trong nhóm là 125.000đ, còn 375.000đ là khoản cần thu hồi. Nếu không tách biệt hai khái niệm này, báo cáo tài chính cá nhân sẽ sai.

Thứ ba: Nên thiết kế hệ thống theo hướng nhiều nhóm độc lập.

Một user có thể tham gia gia đình, công ty và nhóm bạn. Dữ liệu, công nợ và quyền truy cập phải được phân tách theo từng nhóm.
12. Chốt hướng phát triển MVP
Tôi muốn cậu chủ xác định 3 quyết định dưới đây trước khi chuyển sang thiết kế database chi tiết và API.