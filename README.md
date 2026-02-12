# Teskilat ICOM

A modern creative agency platform built with React and Node.js, featuring portfolio management, team showcase, brand clients, and content management capabilities.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

Teskilat ICOM is a full-stack web application designed for creative agencies to showcase their work, team, and brand partnerships. The platform includes an admin dashboard for content management, a public-facing website with dynamic content, and secure authentication.

---

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Vite
- Tailwind CSS
- Axios
- React Icons

### Backend
- Node.js
- Express.js
- MySQL2
- JWT Authentication
- Bcryptjs
- Multer (File Uploads)
- Nodemailer
- Helmet (Security)
- Express Rate Limit

---

## Project Structure

```
teskilat_last_version/
|
|-- backend/
|   |-- src/
|   |   |-- app.js              # Main application entry
|   |   |-- config/
|   |   |   |-- db.js           # Database configuration
|   |   |-- controllers/
|   |   |   |-- adminController.js
|   |   |   |-- authController.js
|   |   |   |-- brandController.js
|   |   |   |-- contactController.js
|   |   |   |-- contentController.js
|   |   |-- middlewares/
|   |   |   |-- authMiddleware.js
|   |   |-- routes/
|   |   |   |-- adminRoutes.js
|   |   |   |-- authRoutes.js
|   |   |   |-- brandRoutes.js
|   |   |   |-- contactRoutes.js
|   |   |   |-- contentRoutes.js
|   |   |   |-- uploadRoutes.js
|   |   |-- utils/
|   |       |-- email.js
|   |       |-- logger.js
|   |       |-- security.js
|   |-- uploads/                # Uploaded files directory
|   |-- package.json
|
|-- frontend/
|   |-- src/
|   |   |-- App.jsx             # Main React component
|   |   |-- main.jsx            # Application entry point
|   |   |-- api.js              # API configuration
|   |   |-- index.css           # Global styles
|   |   |-- components/
|   |   |   |-- Navbar.jsx
|   |   |   |-- ProtectedRoute.jsx
|   |   |   |-- BrandsManager.jsx
|   |   |   |-- ContentManager.jsx
|   |   |   |-- ImageUploader.jsx
|   |   |   |-- ServicesManager.jsx
|   |   |   |-- TeamManager.jsx
|   |   |   |-- WorksManager.jsx
|   |   |-- pages/
|   |   |   |-- Home.jsx
|   |   |   |-- About.jsx
|   |   |   |-- Works.jsx
|   |   |   |-- Team.jsx
|   |   |   |-- Brands.jsx
|   |   |   |-- Contact.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Register.jsx
|   |   |   |-- Announcements.jsx
|   |   |   |-- IcomNetwork.jsx
|   |-- public/
|   |-- assets/
|   |-- package.json
|   |-- vite.config.js
|   |-- tailwind.config.js
|
|-- database.sql                # Main database schema
|-- database_update_*.sql       # Database update scripts
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with required environment variables (see Environment Variables section).

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`.

### Database Setup

1. Create a MySQL database.

2. Import the main schema:
   ```bash
   mysql -u your_username -p your_database < database.sql
   ```

3. Apply any update scripts as needed:
   ```bash
   mysql -u your_username -p your_database < database_update_content.sql
   ```

---

## Features

### Public Website
- Home page with hero section, services, and featured works
- Works portfolio with filtering and video support
- Team member showcase
- Brand/client logos display
- Contact form with email notifications
- ICOM Network information page
- Announcements section

### Admin Dashboard
- Content management for all sections
- Works/portfolio management with image and video uploads
- Team member management
- Brand client management
- Service descriptions editor
- Announcements management
- Image upload with preview

### Security
- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting
- Helmet security headers
- Protected admin routes

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Content
- `GET /api/content/services` - Get all services
- `GET /api/content/site-content` - Get site content
- `GET /api/content/works` - Get all works
- `GET /api/content/works/featured` - Get featured works
- `GET /api/content/videos` - Get videos
- `GET /api/content/announcements/active` - Get active announcements

### Brands
- `GET /api/brands` - Get all brands
- `POST /api/brands` - Create brand (Admin)
- `PUT /api/brands/:id` - Update brand (Admin)
- `DELETE /api/brands/:id` - Delete brand (Admin)

### Contact
- `POST /api/contact` - Submit contact form

### Admin
- `GET /api/admin/*` - Various admin endpoints (Protected)

### Uploads
- `POST /api/upload` - Upload file

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT
JWT_SECRET=your_jwt_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

## License

All rights reserved. Copyright 2025 Teskilat Platform.

---

## Contact

- Website: [teskilat.com.tr](https://teskilat.com.tr)
- Email: info@teskilat.com.tr
- Phone: (0216) 356 59 99
- Address: Kozyatagi Mah. Kaya Sultan Sok. Nanda Plaza No: 83 Kat: 1, 34742 Kadikoy, Istanbul
 