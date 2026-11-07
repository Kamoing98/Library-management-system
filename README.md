# Library Management System

A full-stack library management application built with NestJS, Prisma, and PostgreSQL.

## Overview

This system allows librarians to manage books, genres, and patron borrowing records. Patrons can browse available books and manage their borrowing history.

## Tech Stack

- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL

## Project Structure

```
├── api/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema definition
│   │   └── seed.ts          # Database seeding script
│   └── src/
│       └── prisma/
│           └── prisma.service.ts  # Prisma client service
├── src/                   # React frontend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd api && npm install
   ```
3. Copy the environment file:
   ```bash
   cp api/.env.example api/.env
   ```
4. Update `DATABASE_URL` in `api/.env` with your PostgreSQL credentials
5. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Seed the database:
   ```bash
   npx prisma db seed
   ```

## Schema Decisions

### Why Book References Genre Rather Than Embedding It

The `Book` model references `Genre` through a `genreId` foreign key using Prisma's `@relation` directive, rather than embedding genre information directly within the Book model. This design decision was made for several important reasons:

1. **Data Normalization (3NF)**: Storing genre as a separate entity eliminates data redundancy. Without normalization, every book record would duplicate the genre name string, wasting storage and creating multiple points of truth. If a genre name needs to be updated (e.g., "Sci-Fi" → "Science Fiction"), we only update one row in the `genres` table rather than potentially thousands of book records.

2. **Referential Integrity**: By using a foreign key relationship (`genreId` → `Genre.id`), the database enforces that every book must belong to a valid, existing genre. This prevents orphaned or misspelled genre values from entering the system. The `onDelete: Restrict` policy further ensures that a genre cannot be deleted while books still reference it.

3. **Query Flexibility**: A normalized schema enables powerful queries that would be cumbersome with embedded data:
   - "Find all books in the Fantasy genre" becomes a simple `WHERE genreId = ?` lookup
   - "Count books per genre" is a straightforward `GROUP BY` aggregation
   - "List genres with their book counts" leverages the relation directly

4. **Scalability**: As the library grows, the genre table remains small and cacheable. Adding a new genre requires inserting a single row, and associating books with it only requires setting the foreign key. This is far more efficient than maintaining genre strings across all book records.

5. **Extensibility**: The separate Genre model can easily be extended with additional metadata (description, icon, parent genre for sub-genres, etc.) without affecting the Book model. This follows the Open/Closed Principle — we can extend genre functionality without modifying book logic.

6. **Many-to-Many Potential**: While the current implementation uses a one-to-many relationship (each book has exactly one genre), the normalized approach makes it straightforward to evolve into a many-to-many relationship if the library later decides books can belong to multiple genres. This would only require adding a join table, not restructuring existing data.

### User Role Design

The `Role` enum (PATRON, LIBRARIAN) is stored directly on the User model rather than in a separate table because:
- The roles are fixed and application-defined (not user-managed)
- There are only two roles, making a separate table unnecessary overhead
- Authorization checks are simple: `if (user.role === 'LIBRARIAN')`

### BorrowRecord as a Separate Entity

Borrowing is modeled as its own entity rather than a field on Book or User because:
- A single book can be borrowed multiple times over its lifetime (historical record)
- A patron can have multiple active borrows simultaneously
- Due dates and return tracking are borrow-specific, not book-specific

### Review Model Design

The `Review` model connects `User` and `Book` through foreign keys, with a `@@unique([userId, bookId])` compound constraint ensuring each patron can leave at most one review per book. The `rating` field is an integer (1–5) rather than a float, keeping the domain simple and preventing ambiguous half-star ratings at the database level. The `comment` field is optional (`String?`) to support quick star-only ratings without requiring written feedback.

### Prisma vs. Document Database: What Felt Different

Coming from a document database background (like MongoDB), the biggest shift when modeling in Prisma + PostgreSQL was **thinking in relations before data**. In MongoDB, you'd naturally embed a book's genre as a nested object `{ name: "Fantasy", slug: "fantasy" }` directly inside the book document — it's fast to read, no joins needed, and feels intuitive. With Prisma, you're forced to think about the *boundaries* between entities first: What's a separate table? What's a foreign key? What happens on delete?

This upfront design cost pays off dramatically in **consistency and query power**. In a document DB, updating a genre name means finding and updating every embedded copy — a recipe for stale data. In Prisma, it's a single `UPDATE genres SET name = ... WHERE id = ...`. The trade-off is clear: document databases optimize for *write convenience and read speed* (everything you need is in one document), while Prisma/PostgreSQL optimizes for *data integrity and relational querying*. For a library catalog where books, genres, users, and borrows all interconnect, the relational model's guarantees are worth the extra schema ceremony.

Another notable difference: **Prisma's type safety**. The generated client gives you compile-time guarantees about your queries — `prisma.book.findMany({ include: { genre: true } })` is fully typed. In a document DB, you're often casting `any` or maintaining separate TypeScript interfaces that can drift from reality. Prisma's schema-as-source-of-truth approach eliminates an entire class of bugs.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /books | List all books with genre info |
| GET | /books/:id | Get a single book |
| POST | /books | Create a new book (librarian only) |
| GET | /genres | List all genres |
| POST | /borrow | Borrow a book (patron) |
| POST | /return/:id | Return a borrowed book |
| GET | /users/me | Get current user profile |
| GET | /books/:id/reviews | Get reviews for a book |
| POST | /books/:id/reviews | Add a review (patron) |
| DELETE | /reviews/:id | Delete a review (owner or librarian) |

## License

MIT
