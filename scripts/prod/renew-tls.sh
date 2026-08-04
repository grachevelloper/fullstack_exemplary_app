#!/usr/bin/env sh

set -eu

CERTBOT_IMAGE="${CERTBOT_IMAGE:-certbot/certbot:v5.7.0}"
CERTBOT_WWW_PATH="${CERTBOT_WWW_PATH:-./certbot/www}"
LETSENCRYPT_PATH="${LETSENCRYPT_PATH:-/etc/letsencrypt}"
RENEW_MARKER="$CERTBOT_WWW_PATH/.certbot-renewed"

rm -f "$RENEW_MARKER"

docker run --rm \
    -v "$(cd "$CERTBOT_WWW_PATH" && pwd):/var/www/certbot" \
    -v "$LETSENCRYPT_PATH:/etc/letsencrypt" \
    "$CERTBOT_IMAGE" renew \
    --webroot \
    --webroot-path /var/www/certbot \
    --deploy-hook "touch /var/www/certbot/.certbot-renewed"

if [ -f "$RENEW_MARKER" ]; then
    rm -f "$RENEW_MARKER"
    docker compose exec -T nginx nginx -s reload
fi
