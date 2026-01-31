# Multi-stage Dockerfile for building and running the OpsChat backend application
# Stage 1 : Build the application

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

RUN npx prisma generate

COPY . .

# Stage 2: Runner (Production)

FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./

RUN chmod +x ./docker-entrypoint.sh

RUN chown -R node:node /app

USER node

EXPOSE 3000

ENTRYPOINT [ "./docker-entrypoint.sh" ]