# syntax=docker/dockerfile:1.7

# ─── Stage 1: Install dependencies ───
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ─── Stage 2: Build the Next.js app ───
FROM node:22-alpine AS builder
WORKDIR /app

# Build arguments (needed at build time for NEXT_PUBLIC_* inlining)
ARG NEXTAUTH_BASEPATH
ARG AUTH_API_URL
ARG ASSIGNMENT_API_URL
ARG CLASS_API_URL
ARG EXAM_API_URL
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_ASSIGNMENT_API_URL
ARG NEXT_PUBLIC_CLASS_API_URL
ARG NEXT_PUBLIC_EXAM_API_URL

# Set as env so Next.js can inline NEXT_PUBLIC_* during build
ENV NEXTAUTH_BASEPATH=$NEXTAUTH_BASEPATH \
    AUTH_API_URL=$AUTH_API_URL \
    ASSIGNMENT_API_URL=$ASSIGNMENT_API_URL \
    CLASS_API_URL=$CLASS_API_URL \
    EXAM_API_URL=$EXAM_API_URL \
    NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL \
    NEXT_PUBLIC_ASSIGNMENT_API_URL=$NEXT_PUBLIC_ASSIGNMENT_API_URL \
    NEXT_PUBLIC_CLASS_API_URL=$NEXT_PUBLIC_CLASS_API_URL \
    NEXT_PUBLIC_EXAM_API_URL=$NEXT_PUBLIC_EXAM_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: Production runner ───
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server + static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]