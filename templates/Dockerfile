# Build stage
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Generate Prisma client and build
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
