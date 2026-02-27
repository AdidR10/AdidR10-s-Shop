# Firebase Features Used in This Project

A breakdown of every Firebase service used in this codebase, where it's used, and what it does.

---

## 1. Firebase Authentication

**Used in:** `view/src/apis/firebase.js`, `admin-panel/src/apis/firebase.js`, `functions/APIs/users.js`, `functions/util/auth.js`

### Client Side (View & Admin Panel)
| Method | What it does |
|---|---|
| `signInWithEmailAndPassword` | Logs in a user with email and password |
| `signInWithPopup(GoogleAuthProvider)` | Logs in a user via Google OAuth popup |
| `signOut` | Logs the user out and clears the session |

### Server Side (Cloud Functions)
| Usage | What it does |
|---|---|
| `firebase.auth().signInWithEmailAndPassword` | Used in the `/login` endpoint to authenticate the user and retrieve an ID token |
| `firebase.auth().createUserWithEmailAndPassword` | Used in the `/signup` endpoint to register a new user |
| `admin.auth().verifyIdToken(idToken)` | Used in the auth middleware to verify the Bearer token on every protected route |

The verified token is decoded to extract the user's `uid` and `email`, which is then attached to every incoming request as `request.user`.

---

## 2. Cloud Firestore

**Used in:** `functions/util/admin.js`, all files under `functions/APIs/`

Firestore is the primary database. The admin SDK is initialized once in `admin.js` and shared across all API files.

### Collections & Operations

| Collection | CRUD Operations Performed |
|---|---|
| `users` | Create on signup, read on login and profile fetch, update profile details and image URL |
| `products` | Create, read (all + single), update, delete |
| `categories` | Create, read (all + single), update, delete |
| `orders` | Create (place order), read (all + single), update (mark as shipped), delete |
| `users/{email}/favorites` | Create (add to favorites), read, delete (remove from favorites) |

### Query Patterns Used
- `.collection('products').get()` — fetch all documents
- `.doc(`/users/${email}`).get()` — fetch a single document by ID
- `.collection('users').where('userId', '==', uid).limit(1).get()` — query with filter (used in auth middleware)
- `.collection('products').add(newProduct)` — auto-ID document creation
- `.doc(id).set(data)` — create with specific ID
- `.doc(id).update(data)` — partial update
- `.doc(id).delete()` — delete a document

---

## 3. Firebase Cloud Functions

**Used in:** `functions/index.js`, all files under `functions/APIs/`

The entire backend API is a single Firebase Cloud Function (`exports.api`) that wraps an Express app.

```
exports.api = functions.https.onRequest(app);
```

### How it Works
- All HTTP routes are defined in Express and mounted onto a single `onRequest` function
- The function is exposed at: `https://<region>-<project-id>.cloudfunctions.net/api`
- Locally, it runs on the Firebase Functions Emulator at: `http://localhost:5001/<project-id>/us-central1/api`
- The frontend apps proxy all API calls to this function via `package.json` proxy config

### Route Groups

| Route Group | File | Auth Required |
|---|---|---|
| `/products`, `/categories` | `products.js`, `categories.js` | No (public) |
| `/login`, `/signup` | `users.js` | No |
| `/user`, `/admin/*` | `users.js`, `products.js`, `categories.js`, `orders.js` | Yes |
| `/favorite` | `favorites.js` | Yes |
| `/order` | `orders.js` | Yes |

---

## 4. Firebase Storage

**Used in:** `functions/APIs/products.js`, `functions/APIs/categories.js`, `functions/APIs/users.js`

Firebase Storage is used to store all uploaded images — product images, category images, and user profile photos.

### Operations

| Operation | Trigger | What happens |
|---|---|---|
| **Upload** | `POST /admin/product/image` | Image is parsed with Busboy, uploaded to Storage bucket under `products/` |
| **Upload** | `POST /admin/category/image` | Image uploaded under `categories/` |
| **Upload** | `POST /user/image` | Profile photo uploaded under `users/` |
| **Delete** | `DELETE /admin/product/:id` | Old image is deleted from Storage before the Firestore document is removed |
| **Delete** | `PUT /admin/product/:id` | If a new image is uploaded during edit, the old one is deleted first |
| **URL Generation** | After upload | The public download URL is saved to the Firestore document's `imageUrl` field |

### Local Emulator Behavior
When running locally with the Firebase Storage Emulator (port `9199`), image URLs are generated as:
```
http://localhost:9199/v0/b/<bucket>/o/<filename>?alt=media
```
This replaces the real `firebasestorage.googleapis.com` URL so images display correctly during local development.

---

## 5. Firebase Emulator Suite

**Used in:** `firebase.json`

The full local development environment. No real Firebase services are hit during development.

| Emulator | Port | Purpose |
|---|---|---|
| **Functions** | `5001` | Runs the Express API locally |
| **Firestore** | `8080` | Local in-memory database (wiped on restart) |
| **Storage** | `9199` | Local file storage for image uploads |
| **Emulator UI** | `4000` | Web dashboard to inspect database, storage, and function logs |

All emulators are configured to bind to `0.0.0.0` (all network interfaces) in `firebase.json`, which allows access from any device on the local network.

---

## 6. Firebase Admin SDK

**Used in:** `functions/util/admin.js`

The Admin SDK is used exclusively on the server (Cloud Functions). It has elevated privileges and bypasses security rules.

```js
const admin = require('firebase-admin');
admin.initializeApp();
const database = admin.firestore();
```

### Why Admin SDK and not client SDK on the server?
- The Admin SDK authenticates automatically using the service account credentials provided by the Cloud Functions runtime
- It can verify ID tokens (`admin.auth().verifyIdToken()`), which the client SDK cannot
- It can read and write Firestore without being bound by security rules, which is appropriate for a trusted server environment

---

## Summary Table

| Firebase Service | Where Used | Purpose |
|---|---|---|
| **Authentication** | view, admin-panel, functions | User login, signup, Google OAuth, token verification |
| **Firestore** | functions/APIs/* | All database read/write operations |
| **Cloud Functions** | functions/ | Entire backend REST API |
| **Storage** | functions/APIs/* | Image upload, delete, and URL retrieval |
| **Emulator Suite** | Local dev | Fully local development without billing or cloud |
| **Admin SDK** | functions/util/ | Server-side auth verification and privileged DB access |

---

## 7. Client SDK vs Admin SDK — Deep Dive

### The Core Idea

Think of Firebase as a building:
- **Client SDK** = the **front door** for regular users
- **Admin SDK** = the **master key** for the building manager

---

### Client SDK

**What it is:** The SDK used in the React frontend (browser-side).

**What it can do:**
- Login / signup users
- Read/write Firestore (only what security rules allow)
- Upload files to Storage

**Where it's used in this project:**
- `view/src/configs/firebaseConfig.js` — initializes Firebase in the browser
- `admin-panel/src/configs/firebaseConfig.js` — same for the admin panel
- `view/src/apis/firebase.js` — Google sign-in, email/password login, sign-out
- `admin-panel/src/apis/firebase.js` — same auth methods for the admin panel

**Key limitation:** It **respects security rules** — a user can only access what you explicitly allow.

---

### Admin SDK

**What it is:** The SDK used in the backend (Node.js Cloud Functions).

**What it can do:**
- Bypass all Firestore security rules
- Read/write any document in the database
- Verify user ID tokens (confirm a user is who they claim to be)
- Delete any user account
- Assign custom roles/claims to users

**Where it's used in this project:**
- `functions/util/admin.js` — initializes the Admin SDK once and exports `admin` and `database`
- `functions/util/auth.js` — verifies the Bearer token on every protected API route
- `functions/APIs/products.js`, `categories.js`, `orders.js`, `users.js`, `favorites.js` — all use `database` (Admin SDK) to read/write Firestore

---

### Side by Side Comparison

| Feature | Client SDK | Admin SDK |
|---|---|---|
| Runs in | Browser (React) | Server (Node.js Functions) |
| Follows security rules | ✅ Yes | ❌ Bypasses them |
| Auth capabilities | Login / signup only | Full user management + token verification |
| Who uses it | End users via browser | Your backend code only |
| Risk if exposed | Low | 🔴 Very high — never expose to the browser |

---

### How They Work Together in This Project

```
1. User logs in (Client SDK)
   Browser → Firebase Auth (Client SDK) → Returns a TOKEN

2. User requests protected data (Admin SDK)
   Browser sends TOKEN → Cloud Function →
   Admin SDK verifies TOKEN → "Confirmed: this is user X" →
   Admin SDK fetches data from Firestore → Returns response
```

> ⚠️ **The golden rule:** Admin SDK credentials are automatically provided by the Cloud Functions runtime in production and by the emulator locally. A `serviceAccountKey.json` must **never** be committed to GitHub or sent to the browser. Whoever holds it has unrestricted access to your entire Firebase project.
