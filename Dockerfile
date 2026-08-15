# Build the Vite client and bundled Express server with the complete toolchain.
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image contains only runtime dependencies and the built app.
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared

RUN mkdir -p /app/downloads/midi /app/downloads/scores

EXPOSE 5000

CMD ["node", "dist/index.js"]
