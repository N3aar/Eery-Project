FROM node:20-alpine AS builder

WORKDIR /app

ARG ALLOW_MIGRATIONS=false
ENV ALLOW_MIGRATIONS=${ALLOW_MIGRATIONS}
RUN apk add --no-cache openssl

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY scripts ./scripts

RUN corepack enable && corepack prepare pnpm --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
RUN pnpm generate && pnpm build

# Production stage
FROM node:20-alpine AS runner

ENV TZ=America/Sao_Paulo
ENV NODE_ENV=production

# Install only required system dependencies
RUN apk add --no-cache \
    tzdata \
    openssl \
    dumb-init && \
    ln -s /usr/share/zoneinfo/${TZ} /etc/localtime

WORKDIR /app

# Copy built application and required files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install only production dependencies and generate Prisma client
RUN corepack enable && \
    pnpm install --prod --frozen-lockfile --ignore-scripts && \
    npx prisma generate && \
    pnpm store prune && \
    rm -rf ~/.pnpm-store

VOLUME /data

# Simple entrypoint that checks for migrations
ENTRYPOINT ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ]; then echo 'Running database migrations...'; npx prisma migrate deploy; fi; exec \"$@\"", "--"]

# Default command (migrations can be enabled with RUN_MIGRATIONS=true)
CMD ["node", "dist/index.js"]
