# Backend-Wrapper


A modular Node.js + Express + MongoDB backend template with authentication and utilities.

This boilerplate is designed to help contributors and developers quickly set up, extend, and maintain backend APIs.

## 📂 Project Structure
```
src/
├── controllers/        # Route controllers (business logic)
├── db/                 # Database connection setup
├── middlewares/        # Express middlewares (auth, validation, etc.)
├── models/             # Mongoose models (e.g., User.models.js)
├── routes/             # API routes (e.g., healthCheck, user)
├── util/               # Helpers (ApiError, ApiResponse, asyncHandler, constants)
├── app.js              # Express app initialization
├── index.js            # Entry point
```

## ⚡ Features

✅ Express server setup

✅ MongoDB with Mongoose models

✅ Error handling with ApiError and asyncHandler

✅ Standardized API responses with ApiResponse

✅ JWT-based authentication (Access + Refresh tokens)

✅ Clean modular folder structure

## 🛠️ Getting Started

1. Clone the repo (Fork first)
```bash
git clone https://github.com/your-username/backend-model.git
```
```bash
cd backend-model
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Copy the .env.example file to .env.local:
```bash 
cp .env.local .env
```

Open .env and fill in your secrets:


⚠️ Do not commit .env or real secrets. Only .env.local should be in Git.

4. Run the server
```bash
npm run dev
```


The server will start on http://localhost:4000 (or the port you set).

## 🔑 Authentication Flow

- Register: POST /api/v1/users/register

- Login: POST /api/v1/users/login

- Access token: Short-lived (1h), used for protected routes

- Refresh token: Long-lived (10d), stored in DB + HTTP-only cookie
