FROM node:20-alpine

# Install yarn globally using npm
RUN npm install -g yarn

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Start the application with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && yarn start:dev"] 