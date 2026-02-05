# Use Node.js 20 Alpine as the base image for smaller size
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --prefer-offline


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y dumb-init && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the correct permission for the non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files for production install
COPY package.json package-lock.json ./

# Install only production dependencies with optimization for stability
RUN npm ci --only=production --prefer-offline && npm cache clean --force

# Copy the built application from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user
USER nextjs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Expose port 3000 for the Next.js application
EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]