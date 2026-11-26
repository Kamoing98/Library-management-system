# Library Management System

## Schema Decisions

### Why Book references Genre instead of embedding it

The `Book` model uses a `genreId` foreign key and a Prisma relation to the `Genre` model rather than embedding the genre directly inside each book. This keeps the data normalized and easier to maintain.

1. Data normalization: each genre is stored once, so updates happen in one place instead of across many book rows.
2. Referential integrity: the database ensures every book points to a valid genre.
3. Better queries: filtering books by genre, counting books per genre, and joining related data are straightforward.
4. Easier extension: the `Genre` table can later gain metadata without rewriting every book record.

This is the core design decision behind the catalog structure: `Book` has `genreId` and `@relation(fields: [genreId], references: [id])` to model a reliable one-to-many relationship between genres and books.

### Optional Review note

The stretch `Review` model connects `User` and `Book` so a patron can leave a rating and optional comment. It uses a unique `[userId, bookId]` constraint to prevent duplicate reviews.

### Prisma vs. document database

In a document database, embedding the genre into each book looks convenient at first, but it duplicates data and can become inconsistent over time. Prisma makes the relationship explicit, which strengthens data integrity and makes queries more predictable. For a library catalog, that relational model is a better fit because books, genres, and users are all connected entities.

## Backend API (NestJS + Prisma + PostgreSQL)

JWT authentication with role-based access (`PATRON` / `LIBRARIAN`). All ids are UUIDs.

### Features

- Genre CRUD
- Books with filtering by genre, search (title/author) and pagination
- DTO validation with `class-validator` and a global `ValidationPipe({ whitelist: true })`
- `POST /auth/register` and `POST /auth/login` issue JWTs; passwords are hashed with bcrypt
- `RolesGuard`: only `LIBRARIAN` accounts can create, update or delete books and genres
- `GET /users/profile` returns the authenticated user (reads `req.user` via `@Req()`)
- Login is rate-limited to 5 attempts per minute with `@nestjs/throttler`

### Setup

```bash
cd api
npm install
cp .env.example .env          # edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name add-user-password
npm run prisma:seed
npm run dev
```

The API listens on `http://localhost:3000` (or `PORT`).

> The `User` model gained a required `password` column. If your `users` table already has rows, the migration will fail; clear the table or give the column a temporary default first.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign and verify tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `1d`) |
| `PORT` | Server port (default `3000`) |
| `SEED_LIBRARIAN_EMAIL` / `SEED_LIBRARIAN_PASSWORD` | Librarian account created by the seed |

### Seeding

`npm run prisma:seed` upserts a **LIBRARIAN** (`librarian@example.com` / `password123` unless overridden in `.env`) and a sample **PATRON** (`patron@example.com` / `password123`), then resets and re-creates the genres and books. Users are never deleted by the seed. Anyone who signs up via `POST /auth/register` is always a `PATRON`; the role cannot be chosen at registration.

### Endpoints

| Method | Route | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public (rate-limited) |
| GET | `/users/profile` | Any logged-in user |
| GET | `/genres`, `/genres/:id` | Public |
| POST / PATCH / DELETE | `/genres`, `/genres/:id` | Librarian |
| GET | `/books`, `/books/:id` | Public |
| POST / PATCH / DELETE | `/books`, `/books/:id` | Librarian |

Protected routes need `Authorization: Bearer <token>`.

### Listing books

```
GET /books?genreId=<uuid>&search=tolkien&page=1&limit=10
```

- `genreId`: only books in that genre
- `search`: case-insensitive match on title or author
- `page` (default 1), `limit` (default 10, max 100)

Response: `{ "data": [...books with genre], "meta": { "total", "page", "limit", "totalPages" } }`

### Creating a book

`totalCopies` in the request maps to the `copies` column, and `available` starts equal to it. `publishedAt` is optional.

```json
{ "title": "The Hobbit", "author": "J.R.R. Tolkien", "isbn": "9780261102217", "totalCopies": 5, "genreId": "<genre uuid>" }
```

When `totalCopies` is changed later, `available` is adjusted so borrowed copies stay borrowed. Lowering it below the number currently borrowed is rejected.

### Status codes

| Status | When |
|---|---|
| 400 | Validation failed, or a malformed UUID / query value |
| 401 | Missing or invalid token, or wrong credentials |
| 403 | Logged in but not a LIBRARIAN |
| 404 | Genre or book not found |
| 409 | Duplicate email, genre name or ISBN; deleting a genre that still has books |
| 429 | Too many login attempts |

### Postman

Import `docs/postman_collection.json`. Run **Auth > Login** first; it saves the token to `{{token}}`. **Create genre** and **Create book** save `{{genreId}}` and `{{bookId}}` for the requests that follow.
