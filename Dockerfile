# Stage 1: Build Stage
FROM node:20-alpine AS build

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json, pnpm-lock.yaml, and .npmrc if it exists
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the project files
COPY . .

# # Ensure the DATABASE_URL environment variable is available during the build
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN echo $DATABASE_URL

# Build the application
RUN pnpm run build

# Stage 2: Production Stage
FROM node:20-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy the package.json, pnpm-lock.yaml, and .npmrc files
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install only production dependencies using pnpm
RUN pnpm install --prod

# Copy build output and other necessary files from build stage
COPY --from=build /app/dist /app/dist

# Copy any Prisma files needed in production (e.g., Prisma client)
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/tsconfig.json /app/tsconfig.json

RUN npx prisma migrate deploy && npx prisma generate

RUN apk add --no-cache curl \
    && curl -sfL https://gobinaries.com/tj/node-prune | sh \
    && node-prune \
    && apk del curl

# Expose the application port (change if needed)
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]
