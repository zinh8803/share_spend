# Hướng dẫn Deploy ShareSpend lên VPS (Ubuntu / Debian)

Dự án ShareSpend gồm 2 thành phần chính:
1. **Node.js (Nuxt 3 / Nitro Server)**: Chạy trên port `3000`.
2. **MySQL Database**: Lưu trữ dữ liệu thu chi, nhóm và công nợ trên port `3306`.

---

## Cách 1: Dùng Docker & Docker Compose (Khuyên dùng - Nhanh & Tự động 100%)

Cách này tự động cài đặt và cấu hình cả MySQL lẫn Node.js, tự khởi chạy database và import bảng mẫu `database/schema.sql`.

### Bước 1: Cài đặt Docker trên VPS (nếu chưa có)
```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
```

### Bước 2: Đưa code lên VPS
Bạn có thể dùng `git clone` hoặc phần mềm SFTP (như FileZilla, Mobaxterm, WinSCP) để upload thư mục dự án lên VPS (ví dụ thư mục `/var/www/sharespend`).

### Bước 3: Tạo file `.env` trên VPS
```bash
cd /var/www/sharespend
nano .env
```
Nội dung `.env`:
```env
MYSQL_PASSWORD=MatKhauBaoMatCuaBan_123
PORT=3000
```

### Bước 4: Khởi chạy bằng 1 lệnh
```bash
docker compose up -d --build
```
Kiểm tra trạng thái container:
```bash
docker compose ps
```
Ứng dụng sẽ tự động chạy tại `http://IP_VPS:3000`.

---

## Cách 2: Deploy trực tiếp bằng PM2 + Nginx + MySQL

Nếu bạn muốn chạy trực tiếp không qua Docker để tiết kiệm RAM tối đa cho VPS nhỏ (1GB - 2GB RAM):

### Bước 1: Cài Node.js, MySQL và Nginx trên VPS
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx git

# Cài PM2 để quản lý tiến trình ngầm
sudo npm install -g pm2
```

### Bước 2: Thiết lập MySQL
```bash
sudo mysql
```
Chạy các lệnh SQL bên trong MySQL:
```sql
CREATE DATABASE IF NOT EXISTS `sharespend` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MatKhauMySQL_123';
FLUSH PRIVILEGES;
EXIT;
```

Import cấu trúc database của dự án:
```bash
cd /var/www/sharespend
mysql -u root -p sharespend < database/schema.sql
```

### Bước 3: Cài thư viện và Build Nuxt 3
```bash
cd /var/www/sharespend
npm install
npm run build
```

Tạo file `.env`:
```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=MatKhauMySQL_123
MYSQL_DATABASE=sharespend
PORT=3000
NITRO_HOST=0.0.0.0
NITRO_PORT=3000
```

### Bước 4: Chạy ứng dụng bằng PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## Bước 5 (Chung): Cấu hình Nginx trỏ Domain & Cài SSL HTTPS

### 1. Tạo file cấu hình Nginx:
```bash
sudo nano /etc/nginx/sites-available/sharespend
```
Nội dung:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # Hoặc điền IP VPS nếu chưa có domain

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt site:
```bash
sudo ln -s /etc/nginx/sites-available/sharespend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. Cài chứng chỉ SSL HTTPS miễn phí (Certbot Let's Encrypt):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot sẽ tự động gia hạn SSL và chuyển tiếp mọi kết nối HTTP sang HTTPS.


sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
