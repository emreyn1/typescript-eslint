FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc

FROM node:22-alpine
RUN apk add --no-cache ffmpeg python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN apk del python3 make g++
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/player ./dist/player
EXPOSE 3001
CMD ["node", "dist/server.js"]
