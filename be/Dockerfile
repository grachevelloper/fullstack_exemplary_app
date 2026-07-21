FROM node:20-alpine AS dependencies

RUN corepack enable

WORKDIR /app

COPY package*json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM dependencies AS build

COPY . .

RUN pnpm run build

FROM node:20-alpine AS production

ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY package*json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main"]
