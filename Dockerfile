# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Install ALL deps (incl. devDeps like typescript) for the build
COPY package*.json ./
RUN npm ci

# Compile TypeScript -> dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop devDependencies so we copy a lean node_modules into runtime
RUN npm prune --omit=dev


# ---- Runtime stage ----
FROM node:22-alpine AS runtime

# dumb-init reaps zombies and forwards SIGTERM cleanly to Node (graceful shutdown)
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV TZ=UTC

WORKDIR /app

# Copy production artifacts only
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# Run as the built-in non-root `node` user
USER node

EXPOSE 3000

# Container-level healthcheck hits the app's /health route
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
