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

WORKDIR /app/appointment-service

# Copy package files
COPY appointment-service/package.json appointment-service/package-lock.json* ./
COPY appointment-service/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY appointment-service/. .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/shared ./shared

WORKDIR /app/appointment-service

# Copy built files and dependencies
COPY --from=builder /app/appointment-service/dist ./dist
COPY --from=builder /app/appointment-service/node_modules ./node_modules
COPY --from=builder /app/appointment-service/package.json ./
COPY --from=builder /app/appointment-service/prisma ./prisma

# Create logs directory
RUN mkdir -p logs

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8002/appointments/health || exit 1

# Start the service
CMD ["node", "dist/index.js"]
