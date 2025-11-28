# Product Management API

A robust RESTful API for managing products, built with Node.js, Express, TypeScript, MongoDB, and Redis.

## Features

- **CRUD Operations**: Create, Read, Update, Delete products
- **Advanced Querying**: Pagination, filtering, sorting, and searching
- **Authentication**: Role-Based Access Control (RBAC) with Admin and User roles
- **Caching**: Redis caching for improved performance
- **Validation**: Strict input validation using AJV and Mongoose
- **Rate Limiting**: Protection against abuse
- **Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, and input sanitization
- **Testing**: Comprehensive integration and unit tests with Jest/Supertest
- **Docker**: Containerized application for easy deployment

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Cache**: Redis
- **Testing**: Jest, Supertest
- **Documentation**: Swagger UI
- **Containerization**: Docker, Docker Compose

## Prerequisites

- Node.js (v20+)
- MongoDB
- Redis
- Docker (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ahmedhesein1/Product-Management-API.git
   cd Product-Management-API
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

## Running the Application

### Local Development

```bash
# Start in development mode
npm run dev

# Build and start in production mode
npm run build
npm start
```

The API will be available at `http://localhost:8000`.

### Docker

Run the application with MongoDB and Redis using Docker Compose:

```bash
docker-compose up --build
```

## API Documentation

Interactive API documentation is available at:
`http://localhost:8000/api-docs`

See [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md) for detailed usage instructions.

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 20 requests per 15 minutes
- **Stats Endpoint**: 30 requests per 15 minutes

## Project Structure

```
src/
├── config/         # Configuration (DB, Redis, Swagger)
├── controllers/    # Request handlers
├── middleware/     # Custom middleware (Auth, Cache, Error, RateLimit)
├── models/         # Mongoose models
├── routes/         # API routes
├── tests/          # Integration and Unit tests
├── types/          # TypeScript interfaces
├── validators/     # AJV schemas
└── app.ts          # App entry point
```

## License

ISC