#!/usr/bin/env sh

set -eu

rollback_tag="rollback-$(date -u +%Y%m%dT%H%M%SZ)"

for service in backend frontend; do
    image_id=$(docker compose images -q "$service")
    if [ -n "$image_id" ]; then
        docker image tag "$image_id" "fullstack_exemplary_app-$service:$rollback_tag"
    fi
done

docker compose build backend frontend
docker compose --profile tools run --rm backup
docker compose --profile tools run --rm migration
docker compose up -d --no-deps --force-recreate backend frontend
docker compose up -d nginx

docker compose exec -T backend node -e \
    'fetch("http://127.0.0.1:3000/api/health/ready").then((response) => process.exit(response.ok ? 0 : 1))'

printf '%s\n' "Deployment succeeded. Previous images are tagged: $rollback_tag"
