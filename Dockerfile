FROM node:20-alpine as builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install

COPY . .

RUN pnpm build

FROM node:20-alpine as runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

RUN corepack enable

RUN pnpm install --prod

VOLUME /data

CMD ["pnpm", "start"]