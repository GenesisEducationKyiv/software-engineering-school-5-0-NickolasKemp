# Weather API

A RESTful API service built with NestJS that provides weather data and forecasts.

## Features

- Weather data retrieval by city
- Subscribing to weather updates
- Support for multiple response formats (HTML and JSON)

## Prerequisites

### Option 1: Docker Setup (Recommended)
- Docker and Docker Compose

### Option 2: Local Setup
- Node.js
- Yarn package manager
- PostgreSQL database
- Redis

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

## API Documentation

The API provides the following endpoints:

- `GET /api/weather?city={city}` - Get current weather for a given city with `Temperature`, `Humidity` and `Weather description`
- `POST /api/subscribe` - Subscribe a given `email` to weather updates for a given `city` with a given frequency (`daily` or `hourly`)
- `GET /api/confirm/{token}` - Confirm email subscription (send a link to this endpoint on the confirmation email)
- `GET /api/unsubscribe/{token}` - Unsubscribe from weather updates (send a link to this endpoint in each weather update)


## Running tests

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

```

