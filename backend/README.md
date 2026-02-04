# 🔧 Shopify Backend

This is the backend service for the E-Commerce application, built using **Node.js, Express, and MongoDB**.

The backend is designed with scalability, security, and maintainability in mind.

---

## 🧱 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt.js (password hashing)
- Socket.io
- Nodemon (development)

---

## 📂 Folder Structure

src/
├── config # Database & environment configuration
├── controllers # Business logic
├── models # Mongoose schemas
├── routes # API routes
├── middleware # Auth & error middleware
├── services # External services logic
├── sockets # Real-time communication
└── server.js # App entry point

---

## 🔐 Authentication

- JWT-based authentication
- Passwords hashed using bcrypt
- Role-based access control (User/Admin)

---

## 🚀 Running the Backend

### 1. Install dependencies
npm install
### 2. Create .env file
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
### 3. Run in development
npm run dev

---

## 🧪 API Testing

Use Postman or Thunder Client to test APIs.

Auth Endpoints:-

- POST /api/auth/register
- POST /api/auth/login

## 📌 Development Notes

- Database connection initializes before server starts
- Controllers handle logic, routes stay clean
- Middleware controls access & security