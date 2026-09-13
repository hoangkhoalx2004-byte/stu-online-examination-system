# GIAI ĐOẠN 1: Build Frontend (React/Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# GIAI ĐOẠN 2: Chạy Backend (Nâng cấp lên PHP 8.4 để khớp thư viện)
FROM php:8.4-fpm-alpine

# Cài đặt các thư viện hệ thống cần thiết cho Laravel & PhpSpreadsheet
RUN apk add --no-cache \
    nginx \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libxml2-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev

# Cấu hình và cài đặt PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring gd bcmath zip intl exif

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . .

# Copy kết quả build từ Giai đoạn 1 sang
COPY --from=frontend-builder /app/public/build ./public/build

# Cài đặt dependencies Laravel (Dùng --ignore-platform-reqs nếu cần thiết, nhưng bản 8.3 này đã chuẩn rồi)
RUN composer install --no-dev --optimize-autoloader

# Cấp quyền cho các thư mục Laravel
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Cấu hình Nginx
COPY ./docker/nginx.conf /etc/nginx/http.d/default.conf

# Lệnh khởi động
CMD nginx && php-fpm