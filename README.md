# Store API

A RESTful API built with **Node.js**, **Express.js**, and **MongoDB** for managing store products and user authentication.

## Features

- Product management (CRUD operations)
- Advanced product filtering
- Sorting and field selection
- Pagination
- JWT-based authentication
- Access and refresh token implementation
- Token refresh mechanism
- User logout functionality
- Role-based authorization
- Password hashing
- Password change functionality

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs

## Installation

1. Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

2. Navigate to the project directory:

```bash
cd store-api
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file and configure your environment variables.

5. Start the development server:

```bash
npm run dev
```

## Environment Variables

Configure the following variables in your `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
REFRESH_SECRET=your_refresh_secret
ACCESS_SECRET=your_access_secret
REFRESH_LIFETIME=your_refresh_expiration
ACCESS_LIFETIME=your_access_expiration
```

## API

The API provides endpoints for:

- Products
- User registration and login
- Authentication and authorization
- User profile management

## Author

Developed as a backend development learning project.
