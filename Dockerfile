# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies (layer-cached if lockfile unchanged)
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing (all paths → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
