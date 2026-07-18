# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in the shared workspace packages this service depends on
# (package.json references them as "../shared/packages/*")
COPY shared ./shared

# Build shared packages in dependency order: types -> utils -> middleware
WORKDIR /app/shared/packages/types
RUN npm install && npm run build

WORKDIR /app/shared/packages/utils
RUN npm install && npm run build

WORKDIR /app/shared/packages/middleware
RUN npm install && npm run build

WORKDIR /app/auth-service

# Copy package files
COPY auth-service/package.json auth-service/package-lock.json* ./
COPY auth-service/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY auth-service/. .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/shared ./shared

WORKDIR /app/auth-service

# Copy built files and dependencies
COPY --from=builder /app/auth-service/dist ./dist
COPY --from=builder /app/auth-service/node_modules ./node_modules
COPY --from=builder /app/auth-service/package.json ./
COPY --from=builder /app/auth-service/prisma ./prisma

# Create logs directory
RUN mkdir -p logs

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8001/auth/health || exit 1

# Start the service
CMD ["node", "dist/index.js"]
