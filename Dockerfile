# Stage 1: Build Stage
FROM node:20-alpine3.18 AS build
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN npm install -g pnpm@9.12.2 && pnpm install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the project
RUN pnpm dlx prisma generate && pnpm run build

# Stage 2: Production Stage
FROM node:20-alpine3.18 AS production
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/tsconfig.json /app/tsconfig.json

# Install only production dependencies
RUN npm install -g pnpm@9.12.2 && pnpm install --prod --frozen-lockfile

# Clean up unnecessary files
RUN apk add --no-cache curl \
    && curl -sfL https://gobinaries.com/tj/node-prune | sh \
    && node-prune \
    && apk del curl

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]