# Friendship API

This is a simple API with the following endpoints:

- `POST` /v1/users
- `GET` /v1/users
- `GET` /v1/users/:userId
- `PUT` /v1/users/:userId
- `DELETE` /v1/users/:userId
- `GET` /v1/users/:userId/friends

## Stack

- [Node.js](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [Jest](https://jestjs.io/)
- [Swagger](https://swagger.io/)

## Running the app

For convenience, there is a `docker-run.sh` script that will build the Docker image and run the app.

```bash
chmod +x ./docker-run.sh
./docker-run.sh
```

Note: The app will be running on port 3000, and the database will be running on port 5432. The database will be seeded with some initial data. You can view the API documentation at http://localhost:3000/docs.

## Running the app in development mode

To run the app in development mode, you will need to have Node.js (v21), Yarn and Docker installed.

First, start the database with Docker Compose:

```bash
docker compose --file docker-compose.development.yaml up -d
```

Then, install the dependencies and start the app:

```bash
yarn install
yarn start:dev
```

## Running the tests

To run the tests, you will need to have Node.js, Yarn and Docker installed.

First, start the database with Docker Compose

```bash
docker compose --file docker-compose.test.yaml up -d
```

Then, install the dependencies and run the integration and unit tests:

```bash
yarn install
yarn test
```

You can also run the e2e tests:

```bash
yarn test:e2e
```

If you want to run the tests to check the code coverage, you can run:

```bash
yarn test:cov
```

## API Documentation

The API documentation is available at http://localhost:3000/docs.
