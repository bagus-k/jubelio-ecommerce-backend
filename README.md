# ECommerce API

## Overview

The ECommerce API is a system for managing products and transaction.

---

## API Endpoints

### **Products**

- GET `/api/v1/products`: Fetch a list of products with optional pagination (query parameters: page, limit).
- GET `/api/v1/products/:id`: Fetch detailed information about a specific product.
- POST `/api/v1/products`: Create a new product.
- PUT `/api/v1/products/:id`: Update a specific product.
- DELETE `/api/v1/products/:id`: Delete a specific product.
- GET `/api/v1/products/fetch`: product fetching from `https://dummyjson.com/`.

### **Transactions**

- GET `/api/v1/transactions`: Fetch a list of transactions with optional pagination (query parameters: page, limit).
- GET `/api/v1/transactions/:id`: Fetch detailed information about a specific transaction.
- POST `/api/v1/transactions`: Create a new transaction.
- PUT `/api/v1/transactions/:id`: Update a specific transaction.
- DELETE `/api/v1/transactions/:id`: Delete a specific transaction.

For detailed API documentation, refer to the Swagger docs located in the `docs` folder.

---

## Performance & Scalability Considerations

1. **Pagination**

   - Pagination is implemented to manage large datasets of jobs effectively.

2. **Connection Pool**

   - Implemented to manage many concurrent users and enhance performance.

3. **Rate Limiting**

   - Used to handle high concurrent access.

---

## Security Features

1. **HTML Sanitization**

   - Uses secure html sanitize from `sanitize-html` for enhanced security.

2. **CORS Configuration**

   - CORS is enabled using the @fastify/cors plugin to allow requests from trusted domains only.

---

## Technical Stack

- **Node.js**: JavaScript runtime for building server-side applications.
- **Fastify**: A high-performance web framework for Node.js.
- **pg-promise**: A promise-based PostgreSQL query builder.
- **sanitize-html**: A library for sanitizing HTML content to prevent XSS attacks.
- **@fastify/cors**: Fastify plugin for handling Cross-Origin Resource Sharing (CORS).
- **PostgreSQL**: Primary database.

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/bagus-k/jubelio-ecommerce-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd jubelio-ecommerce-backend
   ```
3. Create Env and set up Environtment based on env.example
   ```bash
   cp .env.example .env
   ```
4. Install dependencies:
   ```bash
    npm install --legacy-peer-deps
   ```
5. To start the server in development mode, use:
   ```bash
   npm run dev
   ```
6. To run test, use:
   ```bash
   npm run test
   ```
