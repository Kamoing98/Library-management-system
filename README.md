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
