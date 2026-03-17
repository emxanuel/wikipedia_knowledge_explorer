FROM node:22-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove workspace config that confuses pnpm in this single-package image
RUN rm -f pnpm-workspace.yaml

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build


FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@9

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start", "-p", "3000"]

