-- ShareSpend MySQL Schema (dựa trên feature.md mục 5)
-- Lưu ý kỹ thuật: dùng BIGINT cho toàn bộ số tiền VND (đơn vị đồng nguyên), không dùng FLOAT.

CREATE DATABASE IF NOT EXISTS `sharespend`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `sharespend`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `frame` VARCHAR(16) NOT NULL DEFAULT '#C9B6FF',
  `gender` VARCHAR(16) NOT NULL DEFAULT 'male',
  `avatar` VARCHAR(64) NOT NULL DEFAULT 'boy-cool',
  `currency` VARCHAR(8) NOT NULL DEFAULT 'VND',
  `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `group_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(120) NOT NULL,
  `kind` ENUM('income', 'expense') NOT NULL DEFAULT 'expense',
  `sticker` VARCHAR(64) NOT NULL DEFAULT 'khac',
  `hint` VARCHAR(255) NOT NULL DEFAULT '',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  INDEX `idx_cat_user` (`user_id`),
  INDEX `idx_cat_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `categories` (`id`, `name`, `kind`, `sticker`, `hint`, `is_default`) VALUES
  ('c-food',   'Ăn uống',      'expense', 'an-uong',   'Ăn sáng, ăn trưa, cà phê…', 1),
  ('c-move',   'Di chuyển',    'expense', 'di-chuyen', 'Xăng xe, taxi, gửi xe…',    1),
  ('c-home',   'Nhà ở',        'expense', 'nha-o',     'Tiền thuê, điện, nước…',    1),
  ('c-shop',   'Mua sắm',      'expense', 'mua-sam',   'Quần áo, đồ dùng…',         1),
  ('c-health', 'Sức khỏe',     'expense', 'suc-khoe',  'Khám bệnh, thuốc…',         1),
  ('c-fun',    'Giải trí',     'expense', 'giai-tri',  'Xem phim, karaoke, du lịch…', 1),
  ('c-other',  'Khác',         'expense', 'khac',      'Các khoản phát sinh…',      1),
  ('c-salary', 'Lương',        'income',  'thu-nhap',  'Lương, thưởng',             1),
  ('c-side',   'Thu nhập phụ', 'income',  'tien',      'Freelance, bán đồ cũ…',     1);

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL DEFAULT 'u1',
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` BIGINT NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `transaction_date` DATE NOT NULL,
  `payment_method` ENUM('cash', 'transfer', 'other') NOT NULL DEFAULT 'transfer',
  `note` VARCHAR(500) NOT NULL DEFAULT '',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tx_user_date` (`user_id`, `transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `groups` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(160) NOT NULL,
  `description` VARCHAR(500) NOT NULL DEFAULT '',
  `group_type` ENUM('friends', 'family', 'company', 'other') NOT NULL DEFAULT 'friends',
  `currency` VARCHAR(8) NOT NULL DEFAULT 'VND',
  `status` ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  `created_by` VARCHAR(36) NOT NULL,
  `invite_code` VARCHAR(32) NOT NULL UNIQUE,
  `frame` VARCHAR(16) NOT NULL DEFAULT '#C9B6FF',
  `created_at` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `group_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `role` ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
  `status` ENUM('active', 'left') NOT NULL DEFAULT 'active',
  `joined_at` DATE NOT NULL,
  UNIQUE KEY `uk_group_user` (`group_id`, `user_id`),
  INDEX `idx_gm_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invitations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `group_id` VARCHAR(36) NOT NULL,
  `invite_code` VARCHAR(32) NOT NULL UNIQUE,
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `group_id` VARCHAR(36) NOT NULL,
  `created_by` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `total_amount` BIGINT NOT NULL,
  `split_type` ENUM('equal', 'exact', 'percent', 'shares') NOT NULL DEFAULT 'equal',
  `expense_date` DATE NOT NULL,
  `description` VARCHAR(500) NOT NULL DEFAULT '',
  `status` ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_exp_group` (`group_id`, `status`, `expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expense_payers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `expense_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `paid_amount` BIGINT NOT NULL,
  INDEX `idx_ep_expense` (`expense_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expense_splits` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `expense_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `share_amount` BIGINT NOT NULL,
  `share_value` DECIMAL(12, 2) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_es_expense` (`expense_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settlements` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `group_id` VARCHAR(36) NOT NULL,
  `from_user_id` VARCHAR(36) NOT NULL,
  `to_user_id` VARCHAR(36) NOT NULL,
  `amount` BIGINT NOT NULL,
  `paid_at` DATE NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  `note` VARCHAR(500) NOT NULL DEFAULT '',
  INDEX `idx_set_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `budgets` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `month` CHAR(7) NOT NULL,
  `limit_amount` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `group_id` VARCHAR(36) DEFAULT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `text` VARCHAR(500) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_act_group` (`group_id`),
  INDEX `idx_act_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `email` VARCHAR(190) NOT NULL,
  `content` TEXT NOT NULL,
  `status` ENUM('pending', 'read', 'resolved') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fb_user` (`user_id`),
  INDEX `idx_fb_status` (`status`),
  INDEX `idx_fb_created` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

