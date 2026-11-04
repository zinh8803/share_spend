import { ref, computed } from 'vue'

export type Lang = 'vi' | 'en'

const currentLang = ref<Lang>('vi')
let initialized = false

export const defaultCategoryNames: Record<string, { vi: string; en: string; hintVi: string; hintEn: string }> = {
  'c-food': { vi: 'Ăn uống', en: 'Food & Dining', hintVi: 'Ăn sáng, ăn trưa, cà phê…', hintEn: 'Breakfast, lunch, coffee…' },
  'c-move': { vi: 'Di chuyển', en: 'Transportation', hintVi: 'Xăng xe, taxi, gửi xe…', hintEn: 'Gas, taxi, parking…' },
  'c-home': { vi: 'Nhà ở', en: 'Housing', hintVi: 'Tiền thuê, điện, nước…', hintEn: 'Rent, electricity, water…' },
  'c-shop': { vi: 'Mua sắm', en: 'Shopping', hintVi: 'Quần áo, đồ dùng…', hintEn: 'Clothes, groceries…' },
  'c-health': { vi: 'Sức khỏe', en: 'Healthcare', hintVi: 'Khám bệnh, thuốc…', hintEn: 'Doctor, pharmacy, medicine…' },
  'c-fun': { vi: 'Giải trí', en: 'Entertainment', hintVi: 'Xem phim, karaoke, du lịch…', hintEn: 'Movies, party, travel…' },
  'c-other': { vi: 'Khác', en: 'Other', hintVi: 'Các khoản phát sinh…', hintEn: 'Miscellaneous expenses…' },
  'c-salary': { vi: 'Lương', en: 'Salary', hintVi: 'Lương, thưởng', hintEn: 'Salary, bonus' },
  'c-side': { vi: 'Thu nhập phụ', en: 'Side Income', hintVi: 'Freelance, bán đồ cũ…', hintEn: 'Freelance, side hustle…' }
}

export const vietnameseCategoryNameToEnglish: Record<string, string> = {
  'Ăn uống': 'Food & Dining',
  'Di chuyển': 'Transportation',
  'Nhà ở': 'Housing',
  'Mua sắm': 'Shopping',
  'Sức khỏe': 'Healthcare',
  'Giải trí': 'Entertainment',
  'Khác': 'Other',
  'Lương': 'Salary',
  'Thu nhập phụ': 'Side Income'
}

export const messages = {
  vi: {
    // Navigation
    'nav.overview': 'Tổng quan',
    'nav.transactions': 'Giao dịch',
    'nav.groups': 'Nhóm',
    'nav.reports': 'Báo cáo',
    'nav.categories': 'Danh mục',
    'nav.settings': 'Cài đặt',
    'nav.admin': 'Quản trị',

    // Header & Actions
    'header.feedback': 'Đóng góp ý kiến',
    'header.addTx': 'Thêm thu chi',
    'header.splitBill': 'Tạo khoản chi',
    'header.loginRegister': 'Đăng nhập / Đăng ký',
    'header.account': 'Tài khoản',

    // Footer
    'footer.tagline': 'Sổ thu chi cá nhân & chia tiền nhóm',
    'footer.terms': 'Chính sách sử dụng',
    'footer.privacy': 'Quyền riêng tư',
    'footer.loggedInAs': 'Đang đăng nhập:',

    // Common
    'common.all': 'Tất cả',
    'common.default': 'Mặc định',
    'common.personal': 'Cá nhân',
    'common.group': 'Theo nhóm',
    'common.delete': 'Xóa',
    'common.cancel': 'Hủy',
    'common.save': 'Lưu',
    'common.saved': 'Đã lưu thành công!',
    'common.saveChanges': 'Lưu thay đổi',
    'common.edit': 'Chỉnh sửa',
    'common.back': 'Quay lại',
    'common.income': 'Khoản thu',
    'common.expense': 'Khoản chi',
    'common.search': 'Tìm kiếm...',
    'common.prevPage': 'Trang trước',
    'common.nextPage': 'Trang sau',
    'common.page': 'Trang',
    'common.total': 'Tổng số',
    'common.amount': 'Số tiền',
    'common.loading': 'Đang tải...',
    'common.confirmDelete': 'Bạn có chắc chắn muốn xóa mục này?',
    'common.you': 'Bạn',
    'common.empty': 'Chưa có dữ liệu.',
    'common.status': 'Trạng thái',
    'common.date': 'Ngày',
    'common.note': 'Ghi chú',
    'common.close': 'Đóng',

    // Feedback modal
    'feedback.badge': 'Hòm thư góp ý',
    'feedback.title': 'Đóng góp ý kiến',
    'feedback.subtitle': 'Góp ý của bạn giúp ShareSpend ngày càng hoàn thiện và hữu ích hơn!',
    'feedback.email': 'Email của bạn',
    'feedback.emailHint': 'Dùng để liên hệ trao đổi thêm hoặc cập nhật kết quả xử lý.',
    'feedback.content': 'Nội dung đóng góp ý kiến',
    'feedback.contentPlaceholder': 'Chia sẻ ý kiến, trải nghiệm, báo lỗi hoặc tính năng bạn muốn có trên ShareSpend...',
    'feedback.send': 'Gửi ý kiến',
    'feedback.sending': 'Đang gửi...',
    'feedback.thankYou': 'Cảm ơn bạn rất nhiều!',
    'feedback.successDesc': 'Ý kiến của bạn đã được ghi nhận vào hệ thống. Đội ngũ ShareSpend sẽ xem xét và tiếp thu ngay.',
    'feedback.sendMore': 'Gửi thêm ý kiến',
    'feedback.done': 'Hoàn tất',
    'feedback.close': 'Đóng',

    // Settings
    'settings.title': 'Cài đặt tài khoản & hồ sơ',
    'settings.subtitle': 'Tùy chỉnh nhân vật nam/nữ, màu khung photobooth, ngôn ngữ và thông tin cá nhân.',
    'settings.language': 'Ngôn ngữ hiển thị (Language)',
    'settings.langVi': 'Tiếng Việt (VI)',
    'settings.langEn': 'English (EN)',
    'settings.displayName': 'Tên hiển thị',
    'settings.email': 'Địa chỉ email',
    'settings.gender': 'Giới tính nhân vật',
    'settings.male': 'Nam',
    'settings.female': 'Nữ',
    'settings.frameColor': 'Màu khung photobooth',
    'settings.avatarPreset': 'Chọn hình mẫu nhân vật',
    'settings.saveBtn': 'Lưu thay đổi',
    'settings.savingBtn': 'Đang lưu...',
    'settings.logout': 'Đăng xuất tài khoản',
    'settings.activity': 'Lịch sử hoạt động của bạn & nhóm',
    'settings.noActivity': 'Chưa có hoạt động nào được ghi nhận.',

    // Categories
    'categories.title': 'Danh mục thu chi',
    'categories.subtitle': 'Quản lý danh mục cá nhân và danh mục riêng cho từng nhóm chi tiêu.',
    'categories.newTitle': 'Tạo danh mục mới',
    'categories.scope': 'Phạm vi áp dụng',
    'categories.scopePersonal': 'Cá nhân (Chỉ tôi)',
    'categories.scopeGroup': 'Nhóm chi tiêu',
    'categories.scopeGroupEmpty': '(Chưa có nhóm)',
    'categories.scopeHintPersonal': 'Danh mục cá nhân chỉ hiển thị riêng cho tài khoản của bạn.',
    'categories.scopeHintGroup': 'Danh mục nhóm sẽ hiển thị cho tất cả thành viên trong nhóm đó.',
    'categories.selectGroup': 'Chọn nhóm chi tiêu',
    'categories.name': 'Tên danh mục',
    'categories.type': 'Phân loại',
    'categories.sticker': 'Chọn hình minh họa 3D',
    'categories.hint': 'Gợi ý ngắn',
    'categories.saveBtn': 'Lưu danh mục',
    'categories.filterAll': 'Tất cả',
    'categories.filterDefault': 'Hệ thống mặc định',
    'categories.filterPersonal': 'Cá nhân của tôi',
    'categories.filterGroup': 'Theo nhóm',
    'categories.groupBadge': 'Nhóm:',
    'categories.fixed': 'Cố định',

    // Dashboard & Overview
    'dashboard.welcome': 'Chào mừng',
    'dashboard.personalStrip': 'Dải ảnh thu chi cá nhân',
    'dashboard.groupsStrip': 'Dải ảnh photobooth các nhóm',
    'dashboard.recentTx': 'Giao dịch gần đây',
    'dashboard.viewAll': 'Xem tất cả',
    'dashboard.createGroup': 'Tạo nhóm mới',
    'dashboard.noGroups': 'Chưa có nhóm chi tiêu nào',
    'dashboard.groupDetails': 'Chi tiết nhóm',
    'dashboard.openGroupDetails': 'Mở chi tiết nhóm',
    'dashboard.members': 'thành viên',
    'dashboard.createdBy': 'tạo bởi',
    'dashboard.totalGroupSpent': 'Tổng chi nhóm',
    'dashboard.youShouldReceive': 'Bạn cần nhận',
    'dashboard.youStillOwe': 'Còn chưa trả',
    'dashboard.manageGroups': 'Quản lý tất cả nhóm',
    'dashboard.manageGroupsCount': 'Quản lý tất cả {count} nhóm',
    'dashboard.paidPartially': 'đã trả một phần ({amount})',
    'dashboard.paidAmount': 'đã trả {amount}',
    'dashboard.sharedExpense': 'khoản chi chung',
    'dashboard.recordPayment': 'Ghi nhận thanh toán',
    'dashboard.newExpense': 'Chia khoản chi mới',
    'dashboard.allDebtsSettled': 'Nhóm này đã thanh toán hết công nợ.',
    'dashboard.emptyGroupTitle': 'Bạn chưa có nhóm chi tiêu chung nào',
    'dashboard.emptyGroupDesc': 'Tạo một nhóm mới để mời bạn bè, thêm hóa đơn chung và theo dõi ai nợ ai trên dải ảnh Photobooth.',
    'dashboard.createFirstGroup': 'Tạo nhóm đầu tiên',
    'dashboard.recordPersonalTx': 'Ghi thu chi cá nhân',
    'dashboard.personalBookOf': 'Sổ thu chi cá nhân của {name}',
    'dashboard.personalBookDesc': 'Tách biệt hoàn toàn giữa tiền đã ứng trả cho nhóm và phần thực tế bạn phải chịu.',
    'dashboard.monthFormat': 'Tháng {m}/{y}',
    'dashboard.personalBalance': 'Số dư cá nhân',
    'dashboard.totalIncome': 'Tổng thu',
    'dashboard.personalExpense': 'Chi riêng',
    'dashboard.groupShare': 'Phần chịu trong nhóm',
    'dashboard.recentPersonalTx': 'Giao dịch cá nhân gần đây',
    'dashboard.addTx': 'Thêm giao dịch',
    'dashboard.noRecentPersonalTx': 'Chưa có giao dịch cá nhân nào. Bấm "Thêm giao dịch" để ghi nhận khoản đầu tiên.',
    'dashboard.debtSummary': 'Tổng hợp công nợ của bạn',
    'dashboard.debtSummaryDesc': 'Cộng gộp trên toàn bộ nhóm đang tham gia.',
    'dashboard.peopleOweYou': 'Mọi người nợ bạn',
    'dashboard.youOwe': 'Bạn đang nợ',
    'dashboard.debtsToCollectAndPay': 'Các khoản cần thu & trả',
    'dashboard.paysYou': '{name} trả cho bạn',
    'dashboard.youPay': 'Bạn trả cho {name}',
    'dashboard.recentActivity': 'Hoạt động mới',
    'dashboard.noActivity': 'Chưa có hoạt động nào trong các nhóm của bạn.',
    'dashboard.itemCount': '{count} khoản · {total}',
    'dashboard.noExpenses': 'Chưa có khoản chi',
    'dashboard.andMore': 'và {count} người nữa',

    // Groups & Expenses
    'groups.title': 'Nhóm chi tiêu',
    'groups.subtitle': 'Mỗi nhóm hoạt động độc lập về thành viên, khoản chi và công nợ. Nhấn vào dải ảnh để mở nhóm.',
    'groups.members': 'Thành viên',
    'groups.expenses': 'Khoản chi',
    'groups.balances': 'Công nợ',
    'groups.settlements': 'Thanh toán',
    'groups.inviteCode': 'Mã mời:',
    'groups.shareLink': 'Chia sẻ link nhóm',
    'groups.copiedLink': 'Đã sao chép link',
    'groups.copyCode': 'Sao chép mã mời',
    'groups.copiedCode': 'Đã sao chép mã',
    'groups.addMember': 'Mời thêm bạn vào nhóm',
    'groups.activeMembers': 'Thành viên đang tham gia',
    'groups.leftMembers': 'Đã rời nhóm',
    'groups.searchMember': 'Tìm theo tên hoặc email thành viên...',
    'groups.groupList': 'Danh sách nhóm',
    'groups.createGroupBtn': 'Tạo khoản chi nhóm',
    'groups.recordPayment': 'Ghi nhận thanh toán',
    'groups.archivedViewOnly': 'Đã lưu trữ · chỉ xem',
    'groups.activeFilter': 'Đang hoạt động',
    'groups.archivedFilter': 'Đã lưu trữ',
    'groups.newExpense': 'Chia khoản chi mới',
    'groups.allSettled': 'Nhóm này đã thanh toán hết công nợ.',
    'groups.whoOwesWhom': 'Ai đang nợ ai',
    'groups.youPaidForOthers': 'Bạn đã trả hộ',
    'groups.yourActualShare': 'Phần bạn thực chịu',
    'groups.yourNetBalance': 'Số dư ròng của bạn',
    'groups.owes': 'nợ',
    'groups.needsToPay': 'cần trả',
    'groups.unsettled': 'Chưa thanh toán',
    'groups.partiallyPaid': 'Đã trả một phần',
    'groups.recentExpensesTitle': 'Khoản chi gần đây',
    'groups.noExpensesYet': 'Chưa có khoản chi nào trong nhóm.',
    'groups.createFirstExpense': 'Tạo khoản chi đầu tiên',
    'groups.createNewTitle': 'Tạo nhóm mới',
    'groups.nameLabel': 'Tên nhóm',
    'groups.typeLabel': 'Loại nhóm',
    'groups.descLabel': 'Mô tả ngắn',
    'groups.createAndGetCode': 'Tạo nhóm & nhận mã mời',
    'groups.joinTitle': 'Tham gia nhóm bằng mã mời',
    'groups.joinDesc': 'Nhập mã mời do chủ nhóm chia sẻ để tham gia vào nhóm.',
    'groups.inviteCodeLabel': 'Mã mời',
    'groups.joinBtn': 'Tham gia nhóm',
    'groups.groupStatus': 'Trạng thái nhóm:',
    'groups.archiveBtn': 'Lưu trữ nhóm này',
    'groups.reactivateBtn': 'Mở lại nhóm',
    'groups.searchExpense': 'Tìm khoản chi trong nhóm',
    'groups.addSharedExpense': 'Thêm khoản chi chung',
    'groups.hasPaid': 'đã thanh toán',
    'groups.detailAndEdit': 'Chi tiết & sửa',
    'groups.newExpenseTitle': 'Tạo khoản chi chung & chia tiền',
    'groups.editExpenseTitle': 'Chỉnh sửa khoản chi & tính lại công nợ',
    'groups.participatingMembers': 'Thành viên tham gia chịu chi phí ({selected}/{total})',
    'groups.selectAll': 'Chọn tất cả',
    'groups.payerBadge': 'Người trả',
    'groups.shareAmount': 'Phần chịu: {amount}',
    'groups.notParticipating': 'Không tham gia khoản này',
    'groups.splitMatched': 'Tổng phân bổ khớp 100%: {total}. {payer} cần nhận lại {receivable}.',
    'groups.newExpenseDefault': 'Khoản chi mới',
    'groups.paidAmount': 'trả {amount}',
    'groups.updateExpenseBtn': 'Cập nhật khoản chi',
    'groups.confirmExpenseBtn': 'Xác nhận & tính công nợ',
    'groups.billTotal': 'Tổng hóa đơn',
    'groups.billPayer': 'Người thanh toán hóa đơn',
    'groups.hasPaidAmount': 'đã trả {amount}',
    'groups.actualShare': 'Phần chịu thực tế',
    'groups.needsToReceive': 'cần nhận lại',
    'groups.fromRemainingMembers': 'Từ {count} thành viên còn lại',
    'groups.breakdownByMember': 'Chi tiết phân bổ từng thành viên',
    'groups.editAndRecalculate': 'Sửa hóa đơn & tính lại',
    'groups.openDebtTable': 'Mở bảng công nợ',
    'groups.deleteThisExpense': 'Xóa khoản chi này',
    'groups.directDebtsTitle': 'Danh sách công nợ trực tiếp',
    'groups.directDebtsDesc': 'Tính tự động từ các hóa đơn và lần trả tiền đã xác nhận.',
    'groups.settlementHistory': 'Lịch sử thanh toán',
    'groups.paidPortion': 'Đã trả {paid} / {gross}',
    'groups.pendingConfirmation': 'Chờ xác nhận: {amount}',
    'groups.recordPayBtn': 'Ghi nhận trả tiền',
    'groups.recordPayFromTo': 'Ghi nhận: {from} trả cho {to}',
    'groups.savePayment': 'Lưu thanh toán',
    'groups.payHalf': 'Trả trước một nửa',
    'groups.paidVsShareTitle': 'Bảng đối chiếu Đã trả & Phải chịu',
    'groups.paidVsShareDesc': 'Tách bạch số tiền đã ứng ra và nghĩa vụ chi tiêu thực tế của từng thành viên.',
    'groups.settlementHistoryTitle': 'Lịch sử hoàn trả trong nhóm ({count})',
    'groups.settledTo': 'hoàn trả cho',
    'groups.confirmReceived': 'Xác nhận đã nhận',
    'groups.manualSettlementTitle': 'Ghi nhận thanh toán thủ công',
    'groups.manualSettlementDesc': 'Nếu bạn là người nhận, khoản trả sẽ được xác nhận ngay.',
    'groups.debtor': 'Người trả nợ',
    'groups.creditor': 'Người nhận tiền',
    'groups.saveSettlementBtn': 'Lưu giao dịch hoàn trả',

    // Join
    'join.title': 'Lời mời tham gia nhóm',
    'join.subtitle': 'Chia sẻ chi phí chuyến đi, bữa ăn chung và tính toán công nợ minh bạch cùng bạn bè.',
    'join.copyInvite': 'Sao chép link mời',
    'join.copiedInvite': 'Đã sao chép link mời',
    'join.currentMembers': 'Thành viên hiện tại',
    'join.alreadyMember': 'Bạn đã tham gia nhóm này rồi!',
    'join.joinNow': 'Tham gia nhóm ngay',
    'join.joining': 'Đang tham gia...',
    'join.loginToJoin': 'Đăng nhập / Đăng ký để vào nhóm',
    'join.loginHint': 'Sau khi đăng nhập bạn sẽ tự động được thêm vào nhóm này.',
    'join.enterCodeTitle': 'Nhập mã mời nhóm',
    'join.enterCodeDesc': 'Dán mã mời hoặc đường link được bạn bè gửi để xem trước và tham gia nhóm.',
    'join.checkCode': 'Kiểm tra mã mời',

    // Reports
    'reports.title': 'Thống kê & Báo cáo',
    'reports.subtitle': 'Phân tích thu chi cá nhân và báo cáo công nợ theo từng nhóm.',
    'reports.modePersonal': 'Báo cáo cá nhân',
    'reports.modeGroup': 'Báo cáo nhóm',
    'reports.includeGroup': 'Bao gồm phần chia từ các nhóm',
    'reports.includeGroupNotice': 'Cộng phần nghĩa vụ chi tiêu của tôi trong nhóm ({amount})',
    'reports.month': 'Tháng',
    'reports.totalIncome': 'Tổng thu nhập',
    'reports.totalExpense': 'Tổng chi thực tế',
    'reports.netSavings': 'Số dư ròng',
    'reports.byCategory': 'Cơ cấu chi tiêu theo danh mục',
    'reports.monthlyCompare': 'So sánh thu & chi giữa các tháng',
    'reports.topExpense': 'Danh mục chi nhiều nhất',
    'reports.groupSpending': 'Tổng chi phí nhóm',
    'reports.settledTotal': 'Đã hoàn trả',
    'reports.unpaidTotal': 'Công nợ chưa trả',
    'reports.myShare': 'Phần bạn phải chịu',
    'reports.topSpender': 'Chi nhiều nhất',
    'reports.topDebtor': 'Đang nợ nhiều nhất',
    'reports.noData': 'Không có dữ liệu trong khoảng thời gian này.',
    'reports.selectGroupAnalysis': 'Chọn nhóm phân tích:',
    'reports.openGroupPage': 'Mở trang nhóm',
    'reports.groupBarTitle': 'So sánh Đã ứng trả và Phần thực chịu theo thành viên',
    'reports.paidForGroup': 'Đã ứng trả',
    'reports.actualGroupShare': 'Phần thực chịu',
    'reports.personalSpend': 'Chi cá nhân',

    // Transactions
    'tx.title': 'Giao dịch cá nhân',
    'tx.subtitle': 'Ghi chép thu nhập và chi tiêu riêng của bạn. Chi phí nhóm được tách riêng để không tính trùng.',
    'tx.manageCategories': 'Quản lý danh mục',
    'tx.filteredIncome': 'Tổng thu theo bộ lọc',
    'tx.filteredExpense': 'Tổng chi theo bộ lọc',
    'tx.balance': 'Số dư (Thu − Chi)',
    'tx.searchLabel': 'Tìm theo nội dung hoặc ghi chú',
    'tx.searchPlaceholder': 'Ví dụ: cà phê, lương, tiền điện...',
    'tx.month': 'Tháng',
    'tx.allMonths': 'Tất cả các tháng',
    'tx.type': 'Loại giao dịch',
    'tx.allTypes': 'Thu & Chi',
    'tx.category': 'Danh mục',
    'tx.allCategories': 'Mọi danh mục',
    'tx.method': 'Phương thức thanh toán',
    'tx.allMethods': 'Tất cả phương thức',
    'tx.transfer': 'Chuyển khoản',
    'tx.cash': 'Tiền mặt',
    'tx.other': 'Khác',
    'tx.thDescription': 'Nội dung',
    'tx.thCategory': 'Danh mục',
    'tx.thMethod': 'Phương thức',
    'tx.thAmount': 'Số tiền',
    'tx.thActions': 'Thao tác',
    'tx.noData': 'Chưa có giao dịch nào khớp với bộ lọc.',
    'tx.emptyTitle': 'Không có giao dịch nào khớp bộ lọc',
    'tx.emptyCaption': 'Thử xóa từ khóa tìm kiếm hoặc ghi nhận một khoản thu chi mới.',
    'tx.addFirst': 'Thêm giao dịch đầu tiên',
    'tx.backToList': 'Quay lại danh sách giao dịch',
    'tx.newTitle': 'Thêm giao dịch cá nhân',
    'tx.editTitle': 'Chỉnh sửa giao dịch cá nhân',
    'tx.amountLabel': 'Số tiền (VND)',
    'tx.willRecord': 'Sẽ ghi nhận: {amount}',
    'tx.descLabel': 'Nội dung',
    'tx.descPlaceholder': 'Ví dụ: Cà phê muối, Lương tháng 10...',
    'tx.noteLabel': 'Ghi chú (tùy chọn)',
    'tx.saveBtn': 'Lưu giao dịch',

    // Auth
    'auth.loginTab': 'Đăng nhập',
    'auth.registerTab': 'Đăng ký',
    'auth.forgotTab': 'Quên mật khẩu',
    'auth.loginTitle': 'Đăng nhập vào ShareSpend',
    'auth.registerTitle': 'Tạo tài khoản mới',
    'auth.forgotTitle': 'Khôi phục mật khẩu',
    'auth.subtitle': 'Tài khoản, giao dịch và nhóm của bạn được đồng bộ an toàn và bảo mật.',
    'auth.namePlaceholder': 'Nhập tên hiển thị của bạn',
    'auth.emailPlaceholder': 'ban@domain.com',
    'auth.passwordPlaceholder': 'Tối thiểu 4 ký tự',
    'auth.loginBtn': 'Đăng nhập',
    'auth.registerBtn': 'Tạo tài khoản',
    'auth.forgotBtn': 'Gửi link khôi phục',

    // Admin
    'admin.badge': 'Khu vực quản trị',
    'admin.activeBadge': 'Admin đang hoạt động',
    'admin.title': 'Trung tâm quản trị ShareSpend',
    'admin.subtitle': 'Quản lý tất cả phản hồi / ý kiến đóng góp từ người dùng và kiểm soát phân quyền tài khoản hệ thống.',
    'admin.reload': 'Tải lại dữ liệu',
    'admin.feedbacksTab': 'Ý kiến đóng góp',
    'admin.usersTab': 'Quản lý tài khoản',
    'admin.pending': 'Chờ xử lý',
    'admin.read': 'Đã đọc',
    'admin.resolved': 'Đã giải quyết',
    'admin.markRead': 'Đánh dấu đã đọc',
    'admin.markResolved': 'Đánh dấu đã giải quyết',
    'admin.resetPending': 'Đặt lại chờ xử lý',
    'admin.deleteFeedback': 'Xóa ý kiến',
    'admin.promoteAdmin': 'Nâng lên Admin',
    'admin.demoteUser': 'Hạ xuống User',
    'admin.roleAdmin': 'Quản trị viên (Admin)',
    'admin.roleUser': 'Thành viên (User)',
    'admin.searchUser': 'Tìm theo tên, email, ID...',
    'admin.accessDenied': 'Quyền truy cập bị từ chối',
    'admin.accessDeniedDesc': 'Trang này chỉ dành riêng cho tài khoản có vai trò Admin (Quản trị viên).'
  },
  en: {
    // Navigation
    'nav.overview': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.groups': 'Groups',
    'nav.reports': 'Reports',
    'nav.categories': 'Categories',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',

    // Header & Actions
    'header.feedback': 'Send Feedback',
    'header.addTx': 'Add Transaction',
    'header.splitBill': 'Split Bill',
    'header.loginRegister': 'Login / Register',
    'header.account': 'Account',

    // Footer
    'footer.tagline': 'Personal expense tracker & group bill splitting',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.loggedInAs': 'Logged in as:',

    // Common
    'common.all': 'All',
    'common.default': 'Default',
    'common.personal': 'Personal',
    'common.group': 'By Group',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.saved': 'Successfully saved!',
    'common.saveChanges': 'Save Changes',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.income': 'Income',
    'common.expense': 'Expense',
    'common.search': 'Search...',
    'common.prevPage': 'Previous',
    'common.nextPage': 'Next',
    'common.page': 'Page',
    'common.total': 'Total',
    'common.amount': 'Amount',
    'common.loading': 'Loading...',
    'common.confirmDelete': 'Are you sure you want to delete this item?',
    'common.you': 'You',
    'common.empty': 'No data yet.',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.note': 'Note',
    'common.close': 'Close',

    // Feedback modal
    'feedback.badge': 'Feedback Box',
    'feedback.title': 'Send Feedback',
    'feedback.subtitle': 'Your thoughts help make ShareSpend better every single day!',
    'feedback.email': 'Your Email',
    'feedback.emailHint': 'We will use this to follow up or share updates with you.',
    'feedback.content': 'Your Feedback / Feature Request',
    'feedback.contentPlaceholder': 'Share ideas, issues, bug reports or features you would love to see on ShareSpend...',
    'feedback.send': 'Submit Feedback',
    'feedback.sending': 'Sending...',
    'feedback.thankYou': 'Thank you so much!',
    'feedback.successDesc': 'Your feedback has been received. The ShareSpend team will review and address it promptly.',
    'feedback.sendMore': 'Send another',
    'feedback.done': 'Done',
    'feedback.close': 'Close',

    // Settings
    'settings.title': 'Account & Profile Settings',
    'settings.subtitle': 'Customize photobooth avatar, frame colors, language and personal details.',
    'settings.language': 'Display Language',
    'settings.langVi': 'Tiếng Việt (VI)',
    'settings.langEn': 'English (EN)',
    'settings.displayName': 'Display Name',
    'settings.email': 'Email Address',
    'settings.gender': 'Avatar Gender',
    'settings.male': 'Male',
    'settings.female': 'Female',
    'settings.frameColor': 'Photobooth Frame Color',
    'settings.avatarPreset': 'Choose Avatar Preset',
    'settings.saveBtn': 'Save Changes',
    'settings.savingBtn': 'Saving...',
    'settings.logout': 'Log Out',
    'settings.activity': 'Recent Activity Log',
    'settings.noActivity': 'No activity recorded yet.',

    // Categories
    'categories.title': 'Expense Categories',
    'categories.subtitle': 'Manage your personal categories and group-specific bill categories.',
    'categories.newTitle': 'Create New Category',
    'categories.scope': 'Category Scope',
    'categories.scopePersonal': 'Personal (Me only)',
    'categories.scopeGroup': 'Expense Group',
    'categories.scopeGroupEmpty': '(No groups yet)',
    'categories.scopeHintPersonal': 'Personal categories are visible only to your private account.',
    'categories.scopeHintGroup': 'Group categories will be available to all members of that group.',
    'categories.selectGroup': 'Select Group',
    'categories.name': 'Category Name',
    'categories.type': 'Type',
    'categories.sticker': 'Select 3D Sticker',
    'categories.hint': 'Short Description',
    'categories.saveBtn': 'Save Category',
    'categories.filterAll': 'All',
    'categories.filterDefault': 'System Default',
    'categories.filterPersonal': 'My Personal',
    'categories.filterGroup': 'By Group',
    'categories.groupBadge': 'Group:',
    'categories.fixed': 'Fixed',

    // Dashboard & Overview
    'dashboard.welcome': 'Welcome',
    'dashboard.personalStrip': 'Personal Expense Strip',
    'dashboard.groupsStrip': 'Group Photobooth Strips',
    'dashboard.recentTx': 'Recent Transactions',
    'dashboard.viewAll': 'View all',
    'dashboard.createGroup': 'Create New Group',
    'dashboard.noGroups': 'No expense groups yet',
    'dashboard.groupDetails': 'Group Details',
    'dashboard.openGroupDetails': 'Open Group Details',
    'dashboard.members': 'members',
    'dashboard.createdBy': 'created by',
    'dashboard.totalGroupSpent': 'Total Group Spent',
    'dashboard.youShouldReceive': 'You should receive',
    'dashboard.youStillOwe': 'You still owe',
    'dashboard.manageGroups': 'Manage all groups',
    'dashboard.manageGroupsCount': 'Manage all {count} groups',
    'dashboard.paidPartially': 'partially paid ({amount})',
    'dashboard.paidAmount': 'paid {amount}',
    'dashboard.sharedExpense': 'shared expense',
    'dashboard.recordPayment': 'Record payment',
    'dashboard.newExpense': 'Split new expense',
    'dashboard.allDebtsSettled': 'All debts in this group are settled.',
    'dashboard.emptyGroupTitle': 'You do not have any groups yet',
    'dashboard.emptyGroupDesc': 'Create a new group to invite friends, add shared bills and track balances on Photobooth strips.',
    'dashboard.createFirstGroup': 'Create First Group',
    'dashboard.recordPersonalTx': 'Record Personal Expense',
    'dashboard.personalBookOf': 'Personal Expense Book of {name}',
    'dashboard.personalBookDesc': 'Separates money advanced for groups from your actual personal spending.',
    'dashboard.monthFormat': 'Month {m}/{y}',
    'dashboard.personalBalance': 'Personal Balance',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.personalExpense': 'Personal Spend',
    'dashboard.groupShare': 'Group Share',
    'dashboard.recentPersonalTx': 'Recent Personal Transactions',
    'dashboard.addTx': 'Add Transaction',
    'dashboard.noRecentPersonalTx': 'No personal transactions yet. Click "Add Transaction" to record your first.',
    'dashboard.debtSummary': 'Your Overall Debt Summary',
    'dashboard.debtSummaryDesc': 'Aggregated across all groups you participate in.',
    'dashboard.peopleOweYou': 'Others owe you',
    'dashboard.youOwe': 'You owe',
    'dashboard.debtsToCollectAndPay': 'Debts to collect & pay',
    'dashboard.paysYou': '{name} pays you',
    'dashboard.youPay': 'You pay {name}',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.noActivity': 'No recent activity in your groups.',
    'dashboard.itemCount': '{count} items · {total}',
    'dashboard.noExpenses': 'No expenses yet',
    'dashboard.andMore': 'and {count} more',

    // Groups & Expenses
    'groups.title': 'Expense Groups',
    'groups.subtitle': 'Each group operates independently with its own members, expenses and settlements. Click a strip to open.',
    'groups.members': 'Members',
    'groups.expenses': 'Expenses',
    'groups.balances': 'Balances',
    'groups.settlements': 'Settlements',
    'groups.inviteCode': 'Invite Code:',
    'groups.shareLink': 'Share Invite Link',
    'groups.copiedLink': 'Link copied',
    'groups.copyCode': 'Copy invite code',
    'groups.copiedCode': 'Code copied',
    'groups.addMember': 'Add Member to Group',
    'groups.activeMembers': 'Active Members',
    'groups.leftMembers': 'Former Members',
    'groups.searchMember': 'Search members by name or email...',
    'groups.groupList': 'Group list',
    'groups.createGroupBtn': 'Create group expense',
    'groups.recordPayment': 'Record payment',
    'groups.archivedViewOnly': 'Archived · view only',
    'groups.activeFilter': 'Active',
    'groups.archivedFilter': 'Archived',
    'groups.newExpense': 'Split new expense',
    'groups.allSettled': 'All debts in this group have been fully settled.',
    'groups.whoOwesWhom': 'Who owes whom',
    'groups.youPaidForOthers': 'You paid for others',
    'groups.yourActualShare': 'Your actual share',
    'groups.yourNetBalance': 'Your net balance',
    'groups.owes': 'owes',
    'groups.needsToPay': 'needs to pay',
    'groups.unsettled': 'Unsettled',
    'groups.partiallyPaid': 'Partially paid',
    'groups.recentExpensesTitle': 'Recent Expenses',
    'groups.noExpensesYet': 'No expenses recorded in this group yet.',
    'groups.createFirstExpense': 'Create first expense',
    'groups.createNewTitle': 'Create New Group',
    'groups.nameLabel': 'Group Name',
    'groups.typeLabel': 'Group Type',
    'groups.descLabel': 'Short Description',
    'groups.createAndGetCode': 'Create Group & Get Code',
    'groups.joinTitle': 'Join Group by Code',
    'groups.joinDesc': 'Enter the invite code shared by the group owner to join.',
    'groups.inviteCodeLabel': 'Invite Code',
    'groups.joinBtn': 'Join Group',
    'groups.groupStatus': 'Group Status:',
    'groups.archiveBtn': 'Archive this group',
    'groups.reactivateBtn': 'Reactivate group',
    'groups.searchExpense': 'Search expenses in group',
    'groups.addSharedExpense': 'Add shared expense',
    'groups.hasPaid': 'has paid',
    'groups.detailAndEdit': 'Details & Edit',
    'groups.newExpenseTitle': 'Create Shared Expense & Split',
    'groups.editExpenseTitle': 'Edit Expense & Recalculate Debts',
    'groups.participatingMembers': 'Members participating in cost ({selected}/{total})',
    'groups.selectAll': 'Select all',
    'groups.payerBadge': 'Payer',
    'groups.shareAmount': 'Share: {amount}',
    'groups.notParticipating': 'Not participating',
    'groups.splitMatched': '100% matched: {total}. {payer} should receive back {receivable}.',
    'groups.newExpenseDefault': 'New Expense',
    'groups.paidAmount': 'paid {amount}',
    'groups.updateExpenseBtn': 'Update Expense',
    'groups.confirmExpenseBtn': 'Confirm & Calculate Debts',
    'groups.billTotal': 'Bill Total',
    'groups.billPayer': 'Bill Payer',
    'groups.hasPaidAmount': 'has paid {amount}',
    'groups.actualShare': 'Actual Personal Share',
    'groups.needsToReceive': 'needs to receive back',
    'groups.fromRemainingMembers': 'From {count} other members',
    'groups.breakdownByMember': 'Breakdown by Member',
    'groups.editAndRecalculate': 'Edit Bill & Recalculate',
    'groups.openDebtTable': 'Open Debt Table',
    'groups.deleteThisExpense': 'Delete this expense',
    'groups.directDebtsTitle': 'Direct Debt Matrix',
    'groups.directDebtsDesc': 'Calculated automatically from shared bills and confirmed settlements.',
    'groups.settlementHistory': 'Settlement History',
    'groups.paidPortion': 'Paid {paid} / {gross}',
    'groups.pendingConfirmation': 'Pending confirmation: {amount}',
    'groups.recordPayBtn': 'Record Payment',
    'groups.recordPayFromTo': 'Record: {from} pays {to}',
    'groups.savePayment': 'Save Payment',
    'groups.payHalf': 'Pay Half First',
    'groups.paidVsShareTitle': 'Paid vs Actual Share Breakdown',
    'groups.paidVsShareDesc': 'Separates money advanced from actual expense liability for each member.',
    'groups.settlementHistoryTitle': 'Group Settlement History ({count})',
    'groups.settledTo': 'settled to',
    'groups.confirmReceived': 'Confirm Received',
    'groups.manualSettlementTitle': 'Record Manual Settlement',
    'groups.manualSettlementDesc': 'If you are the recipient, this payment will be confirmed immediately.',
    'groups.debtor': 'Debtor',
    'groups.creditor': 'Creditor',
    'groups.saveSettlementBtn': 'Save Settlement',

    // Join
    'join.title': 'Group Invitation',
    'join.subtitle': 'Share trip costs, group meals and calculate balances transparently with friends.',
    'join.copyInvite': 'Copy invite link',
    'join.copiedInvite': 'Invite link copied',
    'join.currentMembers': 'Current members',
    'join.alreadyMember': 'You are already a member of this group!',
    'join.joinNow': 'Join group now',
    'join.joining': 'Joining...',
    'join.loginToJoin': 'Log in / Register to join group',
    'join.loginHint': 'After logging in, you will be automatically added to this group.',
    'join.enterCodeTitle': 'Enter Group Invite Code',
    'join.enterCodeDesc': 'Paste the invite code or link sent by your friend to preview and join the group.',
    'join.checkCode': 'Check invite code',

    // Reports
    'reports.title': 'Financial Reports & Analytics',
    'reports.subtitle': 'Visual breakdown of income, expenses and category distributions.',
    'reports.modePersonal': 'Personal Report',
    'reports.modeGroup': 'Group Report',
    'reports.includeGroup': 'Include split shares from groups',
    'reports.includeGroupNotice': 'Include my group expense share ({amount})',
    'reports.month': 'Month',
    'reports.totalIncome': 'Total Income',
    'reports.totalExpense': 'Total Actual Spending',
    'reports.netSavings': 'Net Savings',
    'reports.byCategory': 'Spending Breakdown by Category',
    'reports.monthlyCompare': 'Monthly Income & Expense Comparison',
    'reports.topExpense': 'Highest Spending Category',
    'reports.groupSpending': 'Total Group Spending',
    'reports.settledTotal': 'Total Settled',
    'reports.unpaidTotal': 'Total Unpaid',
    'reports.myShare': 'Your Share in Group',
    'reports.topSpender': 'Top Payer',
    'reports.topDebtor': 'Top Debtor',
    'reports.noData': 'No data recorded for this period.',
    'reports.selectGroupAnalysis': 'Select group for analysis:',
    'reports.openGroupPage': 'Open Group Page',
    'reports.groupBarTitle': 'Paid vs Actual Share by Member',
    'reports.paidForGroup': 'Paid for Group',
    'reports.actualGroupShare': 'Actual Share',
    'reports.personalSpend': 'Personal Spend',

    // Transactions
    'tx.title': 'Personal Transactions',
    'tx.subtitle': 'All your personal income and expense cash flows. Group expenses are separated to avoid double counting.',
    'tx.manageCategories': 'Manage Categories',
    'tx.filteredIncome': 'Filtered Income',
    'tx.filteredExpense': 'Filtered Expense',
    'tx.balance': 'Net Balance (Income − Expense)',
    'tx.searchLabel': 'Search description or note',
    'tx.searchPlaceholder': 'e.g. coffee, salary, electricity...',
    'tx.month': 'Month',
    'tx.allMonths': 'All months',
    'tx.type': 'Transaction Type',
    'tx.allTypes': 'Income & Expense',
    'tx.category': 'Category',
    'tx.allCategories': 'All categories',
    'tx.method': 'Payment Method',
    'tx.allMethods': 'All methods',
    'tx.transfer': 'Bank Transfer',
    'tx.cash': 'Cash',
    'tx.other': 'Other',
    'tx.thDescription': 'Description',
    'tx.thCategory': 'Category',
    'tx.thMethod': 'Method',
    'tx.thAmount': 'Amount',
    'tx.thActions': 'Actions',
    'tx.noData': 'No transactions match your filter.',
    'tx.emptyTitle': 'No transactions match your filter',
    'tx.emptyCaption': 'Try clearing the search query or record a new transaction.',
    'tx.addFirst': 'Add your first transaction',
    'tx.backToList': 'Back to transactions',
    'tx.newTitle': 'Add Personal Transaction',
    'tx.editTitle': 'Edit Personal Transaction',
    'tx.amountLabel': 'Amount (VND)',
    'tx.willRecord': 'Will record: {amount}',
    'tx.descLabel': 'Description',
    'tx.descPlaceholder': 'e.g. Salted coffee, October salary...',
    'tx.noteLabel': 'Note (optional)',
    'tx.saveBtn': 'Save Transaction',

    // Auth
    'auth.loginTab': 'Log In',
    'auth.registerTab': 'Register',
    'auth.forgotTab': 'Forgot Password',
    'auth.loginTitle': 'Log In to ShareSpend',
    'auth.registerTitle': 'Create New Account',
    'auth.forgotTitle': 'Recover Password',
    'auth.subtitle': 'Your account, transactions and groups are safely and securely synced.',
    'auth.namePlaceholder': 'Enter your display name',
    'auth.emailPlaceholder': 'you@domain.com',
    'auth.passwordPlaceholder': 'Minimum 4 characters',
    'auth.loginBtn': 'Log In',
    'auth.registerBtn': 'Create Account',
    'auth.forgotBtn': 'Send Recovery Link',

    // Admin
    'admin.badge': 'Administration',
    'admin.activeBadge': 'Active Administrator',
    'admin.title': 'ShareSpend Admin Center',
    'admin.subtitle': 'Review user feedbacks, feature suggestions and manage user account roles.',
    'admin.reload': 'Reload Data',
    'admin.feedbacksTab': 'User Feedbacks',
    'admin.usersTab': 'User Management',
    'admin.pending': 'Pending',
    'admin.read': 'Read',
    'admin.resolved': 'Resolved',
    'admin.markRead': 'Mark as Read',
    'admin.markResolved': 'Mark as Resolved',
    'admin.resetPending': 'Reset to Pending',
    'admin.deleteFeedback': 'Delete Feedback',
    'admin.promoteAdmin': 'Promote to Admin',
    'admin.demoteUser': 'Demote to User',
    'admin.roleAdmin': 'Administrator (Admin)',
    'admin.roleUser': 'Member (User)',
    'admin.searchUser': 'Search name, email, ID...',
    'admin.accessDenied': 'Access Denied',
    'admin.accessDeniedDesc': 'This portal is strictly restricted to accounts with Administrator privileges.'
  }
}

export function useI18n() {
  if (typeof window !== 'undefined' && !initialized) {
    const saved = localStorage.getItem('sharespend_lang') as Lang | null
    if (saved && (saved === 'vi' || saved === 'en')) {
      currentLang.value = saved
    }
    initialized = true
  }

  function setLang(lang: Lang) {
    currentLang.value = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharespend_lang', lang)
    }
  }

  function t(key: string, params?: Record<string, any>): string {
    const dict = messages[currentLang.value] || messages.vi
    let text = (dict as any)[key] || (messages.vi as any)[key] || key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return text
  }

  function tCategoryName(catOrId: any): string {
    if (!catOrId) return ''
    const id = typeof catOrId === 'string' ? catOrId : catOrId.id
    const name = typeof catOrId === 'object' ? catOrId.name : ''
    if (currentLang.value === 'en') {
      if (id && defaultCategoryNames[id]) return defaultCategoryNames[id].en
      if (name && vietnameseCategoryNameToEnglish[name]) return vietnameseCategoryNameToEnglish[name]
    } else {
      if (id && defaultCategoryNames[id]) return defaultCategoryNames[id].vi
    }
    return name || id || ''
  }

  function tCategoryHint(catOrId: any): string {
    if (!catOrId) return ''
    const id = typeof catOrId === 'string' ? catOrId : catOrId.id
    const hint = typeof catOrId === 'object' ? catOrId.hint : ''
    if (currentLang.value === 'en') {
      if (id && defaultCategoryNames[id]) return defaultCategoryNames[id].hintEn
    } else {
      if (id && defaultCategoryNames[id]) return defaultCategoryNames[id].hintVi
    }
    return hint || ''
  }

  function tSplitType(type: string): string {
    if (currentLang.value === 'en') {
      if (type === 'equal') return 'Equal Split'
      if (type === 'exact') return 'Exact Amount'
      if (type === 'percent') return 'Percentage (%)'
      if (type === 'shares') return 'By Shares'
    } else {
      if (type === 'equal') return 'Chia đều'
      if (type === 'exact') return 'Số tiền tùy chỉnh'
      if (type === 'percent') return 'Theo tỷ lệ %'
      if (type === 'shares') return 'Theo trọng số (phần)'
    }
    return type
  }

  function tPaymentMethod(method: string): string {
    if (currentLang.value === 'en') {
      if (method === 'transfer') return 'Bank Transfer'
      if (method === 'cash') return 'Cash'
      if (method === 'other') return 'Other'
    } else {
      if (method === 'transfer') return 'Chuyển khoản'
      if (method === 'cash') return 'Tiền mặt'
      if (method === 'other') return 'Khác'
    }
    return method
  }

  function tGroupType(type: string): string {
    if (currentLang.value === 'en') {
      if (type === 'friends') return 'Friends / Travel'
      if (type === 'family') return 'Family'
      if (type === 'company') return 'Company / Team'
      if (type === 'other') return 'Roommates / Other'
    } else {
      if (type === 'friends') return 'Nhóm bạn / Du lịch'
      if (type === 'family') return 'Gia đình'
      if (type === 'company') return 'Công ty / Nhóm làm việc'
      if (type === 'other') return 'Nhóm thuê nhà / Khác'
    }
    return type
  }

  function tRole(role: string): string {
    if (currentLang.value === 'en') {
      if (role === 'owner') return 'Owner'
      if (role === 'member') return 'Member'
    } else {
      if (role === 'owner') return 'Chủ nhóm (Owner)'
      if (role === 'member') return 'Thành viên'
    }
    return role
  }

  function tGroupDesc(desc?: string): string {
    if (!desc) return ''
    if (currentLang.value !== 'en') return desc
    if (desc === 'Nhóm chi tiêu chung') return 'Shared expense group'
    if (desc === 'Nhóm bạn') return 'Friends'
    if (desc === 'Gia đình') return 'Family'
    if (desc === 'Công ty') return 'Company / Work'
    return desc
  }

  function tDebtStatus(status: string): string {
    if (currentLang.value === 'en') {
      if (status === 'pending') return 'Pending'
      if (status === 'partial') return 'Partially Paid'
      if (status === 'paid') return 'Settled'
    } else {
      if (status === 'pending') return 'Chưa trả'
      if (status === 'partial') return 'Trả một phần'
      if (status === 'paid') return 'Đã tất toán'
    }
    return status
  }

  function tSettlementStatus(status: string): string {
    if (currentLang.value === 'en') {
      if (status === 'pending') return 'Pending Confirmation'
      if (status === 'confirmed') return 'Confirmed'
      if (status === 'cancelled') return 'Cancelled'
    } else {
      if (status === 'pending') return 'Chờ xác nhận'
      if (status === 'confirmed') return 'Đã xác nhận'
      if (status === 'cancelled') return 'Đã hủy'
    }
    return status
  }

  function tActivity(text: string): string {
    if (!text) return ''
    if (currentLang.value !== 'en') return text

    let s = text
    s = s.replace(/\bthêm\b/g, 'added')
    s = s.replace(/\bsửa\b/g, 'edited')
    s = s.replace(/, công nợ đã được tính lại/g, ', debts recalculated')
    s = s.replace(/\bxóa\b/g, 'deleted')
    s = s.replace(/\. Công nợ liên quan đã được hủy\./g, '. Associated debts cancelled.')
    s = s.replace(/xác nhận đã nhận (.*) trả/g, 'confirmed payment from $1')
    s = s.replace(/ghi nhận đã trả (.*), chờ xác nhận/g, 'recorded payment to $1, pending confirmation')
    s = s.replace(/đã gửi một ý kiến đóng góp cho hệ thống\./g, 'submitted feedback to the system.')
    s = s.replace(/\bnợ\b/g, 'owes')
    return s
  }

  return {
    lang: currentLang,
    setLang,
    t,
    tCategoryName,
    tCategoryHint,
    tSplitType,
    tPaymentMethod,
    tGroupType,
    tRole,
    tGroupDesc,
    tDebtStatus,
    tSettlementStatus,
    tActivity
  }
}
