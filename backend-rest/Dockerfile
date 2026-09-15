FROM node:20-alpine

WORKDIR /app

# Build arguments
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy package files first for better layer caching
# Docker caches this layer and only rebuilds if package.json/package-lock.json changes
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
# This layer changes more frequently, so it comes after dependency installation
COPY . .

# Expose port
EXPOSE 3000

# Change user from root to a non-root user for security.
# node:20-alpine already ships a "node" user (uid/gid 1000) for exactly
# this purpose -- no need to create one (useradd isn't even available on
# Alpine; adduser is the BusyBox equivalent, but the built-in user covers it).
USER node

# Health check - ensures container is running correctly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application with node (not nodemon)
CMD ["node", "exercise_controller.mjs"]
