FROM node:20-alpine as builder

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma

RUN corepack enable

RUN pnpm install
RUN pnpm generate

COPY . .

RUN pnpm build

FROM node:20-alpine as runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN corepack enable

RUN pnpm install --prod
RUN pnpm generate

VOLUME /data

CMD ["pnpm", "start:prod"]