FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (no devDependencies)
RUN npm install --omit=dev

# Copy pre-built dist folder and other necessary files
COPY dist ./dist

# Expose port
EXPOSE 8000

# Start application
CMD ["node", "dist/server.js"]