# Use PHP 8.2
FROM php:8.2-cli

# Install system dependencies (PostgreSQL drivers, unzip for Composer)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Get Composer (the PHP package manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory inside the server
WORKDIR /var/www

# Copy all your backend files into the server
COPY . .

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Fix permissions for the storage folder (Critical for images)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# The command to start the server
# Render automatically sets the $PORT variable
CMD sh -c "php artisan storage:link && php artisan migrate:fresh --force && php artisan serve --host=0.0.0.0 --port=$PORT"