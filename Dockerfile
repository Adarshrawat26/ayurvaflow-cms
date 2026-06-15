FROM node:22-alpine AS builder
WORKDIR /app

# Lower memory use on Railway builders (exit 137 = OOM)
ENV NODE_OPTIONS=--max-old-space-size=2048

COPY package*.json .npmrc ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts

COPY . .
RUN npx prisma generate && npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
# Railway injects PORT at runtime — do not hardcode in production

RUN apk add --no-cache su-exec \
  && addgroup -S ayurva && adduser -S ayurva -G ayurva

# Reuse pruned node_modules from builder — no second npm ci (avoids OOM + prisma postinstall race)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh

RUN chmod +x ./scripts/docker-entrypoint.sh \
  && mkdir -p prisma/data \
  && chown -R ayurva:ayurva prisma/data

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
