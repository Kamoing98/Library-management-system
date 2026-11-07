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

## License

MIT
