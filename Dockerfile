FROM node:26-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ENV NITRO_DATA_DIR=/data/nitro
RUN mkdir -p /data/nitro

COPY . .
RUN npm run build

FROM node:26-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

COPY --from=builder /app/.output .output
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

ENV NITRO_DATA_DIR=/data/nitro

RUN mkdir -p /data/nitro && chown -R nuxt:nodejs /data

USER nuxt

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
