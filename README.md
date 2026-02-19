# Adid's Shop — Full-Stack E-Commerce Application

A full-stack e-commerce platform with a **customer-facing storefront** and a separate **admin management panel**, powered by **React**, **Node.js/Express**, and **Firebase** (Auth, Firestore, Cloud Functions, Storage).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend (Customer)** | React 16, React Router 5, Redux, Redux Thunk, Bootstrap 4, Axios, SCSS |
| **Frontend (Admin)** | React 16, React Router 5, Redux, Redux Thunk, Bulma CSS, Axios |
| **Backend** | Node.js, Express, Firebase Cloud Functions |
| **Database** | Cloud Firestore (NoSQL) |
| **Authentication** | Firebase Auth (Email/Password + Google OAuth) |
| **Storage** | Firebase Cloud Storage (product & category images) |
| **DevOps** | Firebase Emulator Suite (local development), Firebase CLI |

---

## Project Structure

```
├── view/                  # Customer-facing storefront (React SPA)
├── admin-panel/           # Admin dashboard (React SPA)
├── functions/             # Backend API — Firebase Cloud Functions (Express)
├── firebase.json          # Firebase project configuration & emulator settings
├── storage.rules          # Firebase Storage security rules
└── package.json           # Root-level dependencies
```

---

## Features

### Customer Storefront (`view/`)
- User registration & login (Email/Password + Google Sign-In)
- Browse products by category
- Product search with filters (price, brand, material) and sorting
- Product detail pages with image galleries
- Shopping cart with quantity management
- Favorites / wishlist functionality
- Order checkout with order summary
- Responsive design (mobile-friendly)
- Promotional carousel / slider
- Protected routes (auth-guarded)

### Admin Panel (`admin-panel/`)
- Admin authentication (sign in / sign up)
- **Products**: Full CRUD — create, view, edit, delete products with image upload
- **Categories**: Full CRUD — create, view, edit, delete categories with image upload
- **Orders**: View all orders, view order details, mark as shipped, delete orders
- **Users**: View all users, view user details, delete users
- Pagination across all data tables
- Modal confirmations, loading states, and error handling
- Input validation (client-side and server-side)

### Backend API (`functions/`)
- RESTful API built with Express, served via Firebase Cloud Functions
- Token-based authentication middleware using Firebase Auth
- CRUD operations for products, categories, orders, users, and favorites
- Image upload/delete/update via Firebase Storage + Busboy
- Server-side input validation

### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Register a new user |
| `POST` | `/login` | — | Authenticate user |
| `GET` | `/user` | Yes | Get current user details |
| `POST` | `/user` | Yes | Update user details |
| `POST` | `/user/image` | Yes | Upload profile photo |
| `GET` | `/products` | — | List all products (public) |
| `GET` | `/product` | — | Get product details (public) |
| `GET` | `/categories` | — | List all categories (public) |
| `GET` | `/admin/products` | Yes | List all products (admin) |
| `POST` | `/admin/product` | Yes | Create a product |
| `PUT` | `/admin/product/:id` | Yes | Update a product |
| `DELETE` | `/admin/product/:id` | Yes | Delete a product |
| `POST` | `/admin/product/image` | Yes | Upload product image |
| `GET` | `/admin/categories` | Yes | List all categories (admin) |
| `POST` | `/admin/category` | Yes | Create a category |
| `PUT` | `/admin/category/:id` | Yes | Update a category |
| `DELETE` | `/admin/category/:id` | Yes | Delete a category |
| `POST` | `/admin/category/image` | Yes | Upload category image |
| `GET` | `/admin/orders` | Yes | List all orders |
| `GET` | `/admin/order` | Yes | Get order details |
| `POST` | `/order` | Yes | Place a new order |
| `PUT` | `/admin/order/:id` | Yes | Update order status |
| `DELETE` | `/admin/order/:id` | Yes | Delete an order |
| `GET` | `/admin/users` | Yes | List all users |
| `DELETE` | `/admin/user/:email` | Yes | Delete a user |
| `POST` | `/favorite` | Yes | Add to favorites |
| `DELETE` | `/favorite` | Yes | Remove from favorites |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **Firebase CLI** — `npm install -g firebase-tools`
- **Java** (JDK 11+) — required for the Firestore Emulator

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/AdidR10-s-Shop.git
cd AdidR10-s-Shop

# Install root dependencies
npm install

# Install backend dependencies
cd functions && npm install && cd ..

# Install admin panel dependencies
cd admin-panel && npm install && cd ..

# Install customer view dependencies
cd view && npm install && cd ..
```

### 2. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** and **Google** sign-in under Authentication
3. Create a **Firestore** database
4. Create a **Storage** bucket
5. Register a Web App and copy the config
6. Update the Firebase config in:
   - `view/src/configs/firebaseConfig.js`
   - `admin-panel/src/configs/firebaseConfig.js`
   - `functions/util/config.js`

7. Login to Firebase CLI:
```bash
firebase login
firebase use your-project-id
```

### 3. Run Locally with Emulators

**Terminal 1 — Start backend (Firebase Emulators):**
```bash
firebase emulators:start
```
Emulator UI available at: `http://localhost:4000`

**Terminal 2 — Start admin panel:**
```bash
cd admin-panel && npm start
```
Admin panel at: `http://localhost:3006`

**Terminal 3 — Start customer storefront:**
```bash
cd view && npm start
```
Storefront at: `http://localhost:3000`

### 4. Deploy to Production

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Build & deploy frontend (optional — host on Firebase Hosting or any static host)
cd view && npm run build
cd ../admin-panel && npm run build
```

---

## Firestore Data Model

```
├── users/
│   └── {email}
│       ├── firstName, lastName, email, imageUrl
│       ├── createdAt, updatedAt
│       └── favorites: []
│
├── products/
│   └── {productId}
│       ├── title, brand, price, currency
│       ├── material, weight, weightUnit
│       ├── description, itemNumber
│       ├── categoryId, imageUrl
│       └── createdAt
│
├── categories/
│   └── {categoryId}
│       ├── name, imageUrl
│       └── createdAt
│
└── orders/
    └── {orderId}
        ├── userId, products[]
        ├── deliveryAddress, billingAddress
        ├── comments, status
        └── createdAt
```

---

## Environment & Configuration

| Config File | Purpose |
|---|---|
| `firebase.json` | Emulator ports, hosting, functions config |
| `.firebaserc` | Active Firebase project ID |
| `storage.rules` | Firebase Storage security rules |
| `view/src/configs/firebaseConfig.js` | Client-side Firebase SDK config |
| `admin-panel/src/configs/firebaseConfig.js` | Admin-side Firebase SDK config |
| `functions/util/config.js` | Server-side Firebase config |

