# Use Node.js LTS version
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create logs directory and set permissions
RUN mkdir -p logs/app logs/database logs/contract \
    && chmod -R 755 logs

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]