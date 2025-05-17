# Weather API

A RESTful API service built with NestJS that provides weather data and forecasts.

## Features

- Weather data retrieval from external services
- Scheduled weather updates
- Email notifications for weather alerts
- Background job processing with Bull
- Data persistence with Prisma

## Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- PostgreSQL database (or compatible database supported by Prisma)

## Project setup

```bash
# Install dependencies
$ yarn install

# Generate Prisma client
$ npx prisma generate

# Setup database (first time only)
$ npx prisma migrate dev
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/weather-api"
WEATHER_API_KEY="your_weather_api_key"
EMAIL_HOST="smtp.example.com"
EMAIL_USER="your_email@example.com"
EMAIL_PASSWORD="your_email_password"
PORT=3000
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Docker

You can also run the application using Docker with a single command:

```bash
# Build and start the application with Docker
$ docker-compose up -d
```

This will start the API and a PostgreSQL database in containerized environments.

## Running tests

```bash
# unit tests
$ yarn test

# specific test file
$ yarn test path/to/specific.spec.ts

# specific test case
$ yarn test -t "test description"

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

