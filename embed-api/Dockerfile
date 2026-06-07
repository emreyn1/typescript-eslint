# embed-api — thin player + proxy layer in front of CinePro Core.
# Multi-stage build: compile TS → dist, then ship a lean runtime image.
#
# Note: the runtime entrypoint is the existing compiled server at
# `dist/server.js` (package.json "main"/"start"). Reconstructing a `src/`
# server entry is out of scope for task 19.1, so this image runs the existing
# dist/server.js produced by `npm run build`.

# ---- build stage ---------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# better-sqlite3 (optional dep, default storage backend) needs a toolchain to
# build its native addon. Installed only in the build stage.
RUN apk add --no-cache python3 make g++

# Install dependencies against the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Compile src/ → dist/.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime stage -------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# libstdc++ is required at runtime by the prebuilt better-sqlite3 binary.
RUN apk add --no-cache libstdc++

# Production dependencies only (keeps the image small; native addons are
# prebuilt during `npm ci` so no toolchain is needed at runtime).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output from the build stage.
COPY --from=build /app/dist ./dist

# Persisted data (SQLite file / JSON report) lives here; mount a volume to keep
# it across restarts. Owned by the unprivileged `node` user.
RUN mkdir -p /app/data && chown -R node:node /app
USER node

# embed-api listens on PORT (default 3001). ONLY this port is published; Core
# stays loopback-only (see docker-compose.yml).
EXPOSE 3001

# Run the existing compiled server entry.
CMD ["node", "dist/server.js"]
