# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist ./dist
COPY .env ./

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/server.js"]
