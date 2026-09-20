FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @briefly/api...

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY apps/api apps/api
RUN pnpm --filter @briefly/api build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @briefly/api... --prod
COPY --from=build /app/apps/api/dist apps/api/dist
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
