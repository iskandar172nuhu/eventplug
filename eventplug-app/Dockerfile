# ---------- Base ----------
FROM node:20-alpine AS base

# ---------- Dependencies ----------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Create a minimal Prisma CLI install for the production image
RUN mkdir -p /prisma-cli \
    && cd /prisma-cli \
    && echo '{"name":"prisma-cli","private":true}' > package.json \
    && npm install prisma@6.19.3 --save-exact

# ---------- Production ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy the complete Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy production startup script
COPY --from=builder --chown=nextjs:nodejs /app/start.js ./start.js

# Copy Prisma schema and migrations for `npx prisma migrate deploy`
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy Prisma CLI (pre-installed, no runtime download needed)
COPY --from=builder --chown=nextjs:nodejs /prisma-cli/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["node", "start.js"]