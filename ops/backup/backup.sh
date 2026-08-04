#!/usr/bin/env sh

set -eu

: "${DB_HOST:?DB_HOST must be set}"
: "${DB_PORT:?DB_PORT must be set}"
: "${DB_NAME:?DB_NAME must be set}"
: "${DB_USER:?DB_USER must be set}"
: "${DB_PASSWORD:?DB_PASSWORD must be set}"
: "${BACKUP_S3_ENDPOINT:?BACKUP_S3_ENDPOINT must be set}"
: "${BACKUP_S3_REGION:?BACKUP_S3_REGION must be set}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET must be set}"
: "${BACKUP_S3_KEY_ID:?BACKUP_S3_KEY_ID must be set}"
: "${BACKUP_S3_SECRET_ACCESS_KEY:?BACKUP_S3_SECRET_ACCESS_KEY must be set}"

BACKUP_S3_PREFIX="${BACKUP_S3_PREFIX:-postgres}"
export AWS_ACCESS_KEY_ID="$BACKUP_S3_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BACKUP_S3_REGION"
export PGPASSWORD="$DB_PASSWORD"

backup_dir=$(mktemp -d)
trap 'rm -rf "$backup_dir"' EXIT

timestamp=$(date -u +%Y-%m-%dT%H-%M-%SZ)
backup_file="$backup_dir/$timestamp.dump"

pg_dump \
    --host "$DB_HOST" \
    --port "$DB_PORT" \
    --username "$DB_USER" \
    --dbname "$DB_NAME" \
    --format custom \
    --compress 9 \
    --no-owner \
    --no-privileges \
    --file "$backup_file"

s3() {
    aws --endpoint-url "$BACKUP_S3_ENDPOINT" "$@"
}

upload_backup() {
    retention_prefix=$1
    s3 s3 cp "$backup_file" "s3://$BACKUP_S3_BUCKET/$BACKUP_S3_PREFIX/$retention_prefix/$timestamp.dump"
}

prune_backups() {
    retention_prefix=$1
    keep=$2
    prefix="$BACKUP_S3_PREFIX/$retention_prefix/"
    keys=$(s3 s3api list-objects-v2 --bucket "$BACKUP_S3_BUCKET" --prefix "$prefix" --query 'Contents[].Key' --output text | tr '\t' '\n' | sed '/^None$/d' | sed '/^$/d' | sort)
    count=$(printf '%s\n' "$keys" | sed '/^$/d' | wc -l | tr -d ' ')
    remove=$((count - keep))

    if [ "$remove" -gt 0 ]; then
        printf '%s\n' "$keys" | sed -n "1,${remove}p" | while IFS= read -r key; do
            s3 s3 rm "s3://$BACKUP_S3_BUCKET/$key"
        done
    fi
}

upload_backup daily
prune_backups daily 7

day_of_week=$(date -u +%u)
day_of_month=$(date -u +%d)

if [ "$day_of_week" = 7 ]; then
    upload_backup weekly
    prune_backups weekly 4
fi

if [ "$day_of_month" = 01 ]; then
    upload_backup monthly
    prune_backups monthly 6
fi
