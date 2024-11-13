# Stage 1: Build Stage
FROM node:18 AS build

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

# Run Prisma migrations (before the build)
RUN npx prisma migrate deploy

# Build the application
RUN pnpm run build

# Stage 2: Production Stage
FROM node:18 AS production

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
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/prisma /app/prisma

# Expose the application port (change if needed)
EXPOSE 3000

# Start the application
CMD ["node", "dist/app.js"]
