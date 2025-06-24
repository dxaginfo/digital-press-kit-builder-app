# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Set back to app directory
WORKDIR /app

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]