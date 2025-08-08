FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application source
COPY . .

# Build only the notification-sender application
RUN yarn build:notification-sender

# Expose the application port
EXPOSE 3002

# Start the notification-sender application
CMD ["yarn", "start:notification-sender"] 