FROM node:22-alpine
WORKDIR /app

# Copy package-specific files
COPY packages/gateway/package.json packages/gateway/tsconfig.json ./
# Copy shared base TypeScript config
COPY tsconfig.json /tsconfig.json

COPY packages/gateway/src ./src
RUN npm install && npm run build
CMD ["node", "dist/index.js"]
