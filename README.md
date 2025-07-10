# Weather API

A RESTful API service built with NestJS that provides weather data and forecasts.

## Features

- Weather data retrieval by city
- Subscribing to weather updates
- Multiple weather providers with failover support

## Prerequisites

### Option 1: Docker Setup (Recommended)

- Docker and Docker Compose

### Option 2: Local Setup

- Node.js
- Yarn package manager
- PostgreSQL database
- Redis

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
WEATHER_API_KEY="your_weather_api_key" # https://www.weatherapi.com/
OPENWEATHER_API_KEY="your_openweather_api_key" # https://openweathermap.org/api
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email_for_weather_forecast_mailing"
SMTP_PASS="your_google_account_app_pass" # https://myaccount.google.com/apppasswords

# if you picked the local setup, make sure to spin up these services
DATABASE_URL="postgresql://user:password@postgres:5432/weather_service?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

## Running locally

```bash
# Install dependencies
$ yarn install

# Generate Prisma client
$ npx prisma generate

# Setup database (first time only)
$ npx prisma migrate dev

# development
$ yarn start
```

## Docker

You can also run the application using Docker with a single command:

```bash
# Build and start the application with Docker
$ docker-compose up -d
```

This will start the API and a PostgreSQL database in containerized environments.

## API

The API provides the following endpoints:

- `GET /` - Returns an HTML page for weather subscription
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
