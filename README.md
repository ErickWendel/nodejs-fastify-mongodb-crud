# CRUD Ops with Node.js, Fastify, and MongoDB using the Node.js Test Runner

![Build Status](https://github.com/ErickWendel/nodejs-fastify-mongodb-crud/workflows/Run%20tests/badge.svg)

## Description

This project demonstrates how to perform CRUD operations using Node.js with the Fastify framework and MongoDB. It includes unit tests that verify the functionality of the API endpoints and track code coverage.

## Getting Started

### Prerequisites
- Docker and Docker compose
- Node.js (version 20 or later)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ErickWendel/nodejs-fastify-mongodb-crud.git
   cd nodejs-fastify-mongodb-crud
   ```

2. Install the dependencies:
   ```bash
   npm ci
   ```
### Running Tests

To run the tests and see code coverage, use:
```bash
docker-compose up -d mongodb
npm test
```
This will execute the tests defined in the project and provide a coverage report.


### Running the Project

To initialize the MongoDB, run:
```bash
docker-compose up -d mongodb
```

To initialize the project, run:
```bash
npm start
```
The server will start, and you can access the API on `http://localhost:9999` (or your specified port).


### API Endpoints

Here are the available routes for performing CRUD operations on customers:

1. **Create a Customer** (POST)
   ```bash
   curl -X POST http://localhost:9999/customers \
   -H "Content-Type: application/json" \
   -d '{"name": "John Doe", "phone": "123456789"}'
   ```

2. **Retrieve All Customers** (GET)
   ```bash
   curl http://localhost:9999/customers
   ```

3. **Retrieve a Customer by ID** (GET)
   ```bash
   curl http://localhost:9999/customers/<customer_id>
   ```

4. **Update a Customer** (PUT)
   ```bash
   curl -X PUT http://localhost:9999/customers/<customer_id> \
   -H "Content-Type: application/json" \
   -d '{"name": "Jane Doe", "phone": "987654321"}'
   ```

5. **Delete a Customer** (DELETE)
   ```bash
   curl -X DELETE http://localhost:9999/customers/<customer_id>
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Fastify](https://www.fastify.io/) - Fast and low-overhead web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database for storing data
- [Node.js Test Runner](https://nodejs.org/en/docs/guides/test-runner/) - Built-in test runner for Node.js