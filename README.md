
# Transfer App Backend

This project is a secure, production-ready backend for a digital wallet and money transfer platform, built with [NestJS](https://nestjs.com/) and TypeScript.

## Features

- User registration, login, and JWT authentication
- Password and PIN reset via email
- Wallet management (balance, funding)
- Money transfers between users
- Payment API integration (e.g., Paystack)
- Modular, scalable architecture
- Input validation and security best practices
- API documentation with Swagger
- Unit and e2e testing

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- Yarn
- PostgreSQL

### Installation

```bash
yarn install
```

### Environment Setup
Create a `.env` file in the project root with the following variables:

```
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/transfer_app
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

### Running the App

```bash
# development
yarn start

# watch mode
yarn start:dev

# production
yarn start:prod
```

### Testing

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# test coverage
yarn test:cov
```

## API Endpoints

### Auth
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive JWT
- `POST /auth/forgot-password` — Request password reset
- `POST /auth/reset-password` — Reset password

### Users
- `GET /users/:id` — Get user by ID (JWT required)

### Wallet
- `GET /wallet/balance` — Get wallet balance (JWT required)
- `POST /wallet/fund` — Fund wallet (JWT required)

### Transactions
- `POST /transactions/transfer` — Transfer funds to another user (JWT required)

### Payment
- `POST /payment` — Initiate payment via provider (JWT required)

### API Docs
- Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)

## Security & Best Practices
- Input validation with DTOs and class-validator
- JWT authentication and guards
- Helmet for HTTP security headers
- Environment-based configuration
- Error handling and logging
- Rate limiting (recommended for production)

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## License
MIT
