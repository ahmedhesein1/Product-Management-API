# Product Management API

A production-ready RESTful API for managing products with advanced caching, authentication, and comprehensive testing. Built with modern technologies and best practices.

## 🚀 Key Features

- **Complete CRUD Operations** with validation and error handling
- **Redis Caching Layer** with intelligent cache invalidation
- **Role-Based Access Control (RBAC)** - Admin and User roles
- **Advanced Query Features** - Pagination, filtering, sorting, and full-text search
- **Rate Limiting & Security** - Protection against abuse with Helmet and CORS
- **Comprehensive Testing** - 95%+ code coverage with Jest
- **Interactive API Documentation** - Swagger/OpenAPI UI
- **Docker Support** - Fully containerized for easy deployment
- **Production-Ready** - TypeScript, error handling, logging, and monitoring

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Backend** | Node.js 20, Express.js 5, TypeScript 5 |
| **Database** | MongoDB Atlas (Cloud) |
| **Cache** | Redis 7 |
| **Validation** | AJV (JSON Schema), Mongoose Schema |
| **Testing** | Jest, Supertest, MongoDB Memory Server |
| **Documentation** | Swagger/OpenAPI 3.0 |
| **DevOps** | Docker, Docker Compose |
| **Code Quality** | ESLint, Prettier, TypeScript strict mode |

## 📋 Prerequisites

Choose one of the following setups:

### Option 1: Docker (Recommended - Zero Configuration)
- Docker Engine 20+
- Docker Compose 2+

### Option 2: Local Development
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Redis 7+

## 🚀 Quick Start

### Using Docker (Recommended)

The easiest way to run the entire stack:

```bash
# 1. Clone the repository
git clone https://github.com/ahmedhesein1/Product-Management-API.git
cd Product-Management-API

# 2. Create environment file
cp .env.example .env
# Edit .env with your MongoDB Atlas URI

# 3. Start all services (API + Redis)
docker compose up -d

# 4. View logs
docker compose logs -f

# 5. API is ready at http://localhost:8000
curl http://localhost:8000/health
```

**What's included:**
- ✅ Node.js application container
- ✅ Redis container for caching
- ✅ Automatic networking between containers
- ✅ Persistent Redis data with volumes
- ✅ Health checks and auto-restart


### Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start development server
npm run dev
```

## 📚 API Documentation

Interactive API documentation is available at: **http://localhost:8000/api-docs**

### Quick API Overview

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/products` | GET | List all products | Yes |
| `/api/products/:id` | GET | Get product by ID | Yes |
| `/api/products` | POST | Create product | Admin |
| `/api/products/:id` | PUT | Update product | Admin |
| `/api/products/:id` | DELETE | Delete product | Admin |
| `/api/products/stats` | GET | Get statistics | Admin |

## 🧪 Testing

Comprehensive test suite with high coverage:

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (development)
npm run test:watch

# Run CI tests
npm run test:ci
```

**Test Coverage:**
- Integration tests for all API endpoints
- Unit tests for business logic
- Redis caching behavior tests
- Authentication and authorization tests
- Error handling validation

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Prevents abuse
  - General API: 100 req/15min
  - Auth endpoints: 20 req/15min
  - Stats endpoint: 30 req/15min
- **Input Validation**: AJV JSON Schema validation
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Admin/User permissions
---
