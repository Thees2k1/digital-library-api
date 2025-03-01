FROM node:20-alpine3.18 
WORKDIR /app

# Copy only the necessary files from the build stage
COPY .dist /app/dist
COPY package.json pnpm-lock.yaml* ./
COPY ./node_modules /app/node_modules
COPY ./prisma /app/prisma
COPY tsconfig.json /app/tsconfig.json

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