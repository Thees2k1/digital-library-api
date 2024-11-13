# Stage 1: Build Stage
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if you use it)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Run Prisma migrations (before the build)
RUN npx prisma migrate deploy

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:18 AS production

# Set working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy build output and other necessary files from build stage
COPY --from=build /app/dist /app/dist

# Copy any Prisma files needed in production (e.g., Prisma client)
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/prisma /app/prisma

# Expose the application port (change if needed)
EXPOSE 3000

# Start the application
CMD ["node", "dist/app.js"]
