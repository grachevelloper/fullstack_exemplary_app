#!/usr/bin/env sh

set -eu

: "${NGINX_SERVER_NAME:?NGINX_SERVER_NAME must be set}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL must be set}"

CERTBOT_IMAGE="${CERTBOT_IMAGE:-certbot/certbot:v5.7.0}"
CERTBOT_WWW_PATH="${CERTBOT_WWW_PATH:-./certbot/www}"
LETSENCRYPT_PATH="${LETSENCRYPT_PATH:-/etc/letsencrypt}"

mkdir -p "$CERTBOT_WWW_PATH" "$LETSENCRYPT_PATH"

docker compose up -d db
docker compose --profile tools run --rm migration
NGINX_TEMPLATE=./nginx/prod-http.conf.template \
    docker compose up -d --build backend frontend nginx

docker run --rm \
    -v "$(cd "$CERTBOT_WWW_PATH" && pwd):/var/www/certbot" \
    -v "$LETSENCRYPT_PATH:/etc/letsencrypt" \
    "$CERTBOT_IMAGE" certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$LETSENCRYPT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domain "$NGINX_SERVER_NAME"

NGINX_TEMPLATE=./nginx/prod.conf.template \
    docker compose up -d --force-recreate nginx
