FROM node:20-alpine as builder

WORKDIR /app

ENV ALLOW_MIGRATIONS false
RUN apk add --no-cache openssl

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma

RUN corepack enable && corepack prepare pnpm --activate

RUN pnpm install

COPY . .

RUN pnpm generate
RUN pnpm build

FROM node:20-alpine as runner

ENV TZ America/Sao_Paulo

RUN apk add --no-cache tzdata openssl
RUN ln -s /usr/share/zoneinfo/${TZ} /etc/localtime

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