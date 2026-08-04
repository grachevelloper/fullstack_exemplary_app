#!/usr/bin/env sh

set -eu

: "${RESTORE_S3_KEY:?RESTORE_S3_KEY must be set to an object key under the backup bucket}"
: "${RESTORE_DB_NAME:?RESTORE_DB_NAME must be set}"
: "${BACKUP_S3_ENDPOINT:?BACKUP_S3_ENDPOINT must be set}"
: "${BACKUP_S3_REGION:?BACKUP_S3_REGION must be set}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET must be set}"
: "${BACKUP_S3_KEY_ID:?BACKUP_S3_KEY_ID must be set}"
: "${BACKUP_S3_SECRET_ACCESS_KEY:?BACKUP_S3_SECRET_ACCESS_KEY must be set}"

if [ "$RESTORE_DB_NAME" = "${DB_NAME:-}" ]; then
    echo "Refusing to restore over DB_NAME; use a separate RESTORE_DB_NAME." >&2
    exit 1
fi

docker compose --profile tools run --rm --entrypoint sh \
    -e AWS_ACCESS_KEY_ID="$BACKUP_S3_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY" \
    -e AWS_DEFAULT_REGION="$BACKUP_S3_REGION" \
    -e RESTORE_S3_KEY="$RESTORE_S3_KEY" \
    -e RESTORE_DB_NAME="$RESTORE_DB_NAME" \
    backup -ec '
        backup_file=$(mktemp)
        trap "rm -f \"$backup_file\"" EXIT
        aws --endpoint-url "$BACKUP_S3_ENDPOINT" s3 cp "s3://$BACKUP_S3_BUCKET/$RESTORE_S3_KEY" "$backup_file"
        PGPASSWORD="$DB_PASSWORD" createdb --host "$DB_HOST" --port "$DB_PORT" --username "$DB_USER" "$RESTORE_DB_NAME"
        PGPASSWORD="$DB_PASSWORD" pg_restore --host "$DB_HOST" --port "$DB_PORT" --username "$DB_USER" --dbname "$RESTORE_DB_NAME" --no-owner --no-privileges "$backup_file"
    '
