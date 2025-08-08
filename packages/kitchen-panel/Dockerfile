FROM node:22-alpine as build
WORKDIR /app

# Copy package-specific files
COPY packages/kitchen-panel/package.json packages/kitchen-panel/tsconfig.json packages/kitchen-panel/vite.config.ts packages/kitchen-panel/index.html ./
# Copy shared base TypeScript config
COPY tsconfig.json /tsconfig.json

COPY packages/kitchen-panel/src ./src
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
