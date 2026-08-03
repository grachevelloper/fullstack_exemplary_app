# Сайт Николая Грачева

The application is available at <http://fe_fullstack-app.localhost> in both supported development modes. Local HTTPS is not configured.

## BE and FE on the host

Create local environment files once:

```bash
cp be/.env.example be/.env
cp fe/.env.example fe/.env
```

Start PostgreSQL and nginx:

```bash
docker compose -f be/dev/db/compose.yaml up -d
```

Then start the applications in separate terminals:

```bash
cd be
npm run start
```

```bash
cd fe
npm run start
```

Stop the infrastructure with:

```bash
docker compose -f be/dev/db/compose.yaml down
```

## VPS deployment

The root `docker-compose.yaml` is the single production Compose configuration.
Before the first deployment, create `.env` from `.env.example`, set real secrets
and the domain, then obtain the TLS certificate:

```bash
sh scripts/prod/bootstrap-tls.sh
```

For subsequent releases, run:

```bash
sh scripts/prod/deploy.sh
```

## Requirements

Docker must be running. Local host development uses ports 3000 and 5173; the VPS deployment needs ports 80 and 443. Names ending in `.localhost` resolve to the loopback interface in modern browsers, so `/etc/hosts` normally does not need to be changed.
