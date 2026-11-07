import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters due to foreign key constraints)
  await prisma.review.deleteMany();
  await prisma.borrowRecord.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();

  // Insert Genre rows (at least 4)
  const genres = await Promise.all([
    prisma.genre.create({
      data: {
        name: 'Fiction',
        slug: 'fiction',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Science Fiction',
        slug: 'science-fiction',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Non-Fiction',
        slug: 'non-fiction',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Fantasy',
        slug: 'fantasy',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Mystery',
        slug: 'mystery',
      },
    }),
  ]);

  const [fiction, sciFi, nonFiction, fantasy, mystery] = genres;

  console.log(`✅ Created ${genres.length} genres`);

  // Insert Book rows (at least 15, distributed across genres)
  const books = await Promise.all([
    // Fiction (4 books)
    prisma.book.create({
      data: {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        publishedAt: new Date('1925-04-10'),
        copies: 5,
        available: 3,
        genreId: fiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0061120084',
        publishedAt: new Date('1960-07-11'),
        copies: 4,
        available: 2,
        genreId: fiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0141439518',
        publishedAt: new Date('1813-01-28'),
        copies: 3,
        available: 3,
        genreId: fiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'One Hundred Years of Solitude',
        author: 'Gabriel García Márquez',
        isbn: '978-0060883287',
        publishedAt: new Date('1967-05-30'),
        copies: 3,
        available: 1,
        genreId: fiction.id,
      },
    }),

    // Science Fiction (3 books)
    prisma.book.create({
      data: {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '978-0441013593',
        publishedAt: new Date('1965-08-01'),
        copies: 4,
        available: 2,
        genreId: sciFi.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Neuromancer',
        author: 'William Gibson',
        isbn: '978-0441569595',
        publishedAt: new Date('1984-07-01'),
        copies: 3,
        available: 3,
        genreId: sciFi.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Left Hand of Darkness',
        author: 'Ursula K. Le Guin',
        isbn: '978-0441478125',
        publishedAt: new Date('1969-03-01'),
        copies: 2,
        available: 1,
        genreId: sciFi.id,
      },
    }),

    // Non-Fiction (3 books)
    prisma.book.create({
      data: {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0062316097',
        publishedAt: new Date('2011-01-01'),
        copies: 5,
        available: 4,
        genreId: nonFiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        isbn: '978-0374533557',
        publishedAt: new Date('2011-10-25'),
        copies: 3,
        available: 2,
        genreId: nonFiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Educated',
        author: 'Tara Westover',
        isbn: '978-0399590504',
        publishedAt: new Date('2018-02-27'),
        copies: 4,
        available: 3,
        genreId: nonFiction.id,
      },
    }),

    // Fantasy (3 books)
    prisma.book.create({
      data: {
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        isbn: '978-0756404741',
        publishedAt: new Date('2007-03-27'),
        copies: 4,
        available: 2,
        genreId: fantasy.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'A Game of Thrones',
        author: 'George R.R. Martin',
        isbn: '978-0553593716',
        publishedAt: new Date('1996-08-01'),
        copies: 5,
        available: 3,
        genreId: fantasy.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Way of Kings',
        author: 'Brandon Sanderson',
        isbn: '978-0765365279',
        publishedAt: new Date('2010-08-31'),
        copies: 3,
        available: 2,
        genreId: fantasy.id,
      },
    }),

    // Mystery (3 books)
    prisma.book.create({
      data: {
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        isbn: '978-0307949486',
        publishedAt: new Date('2005-08-01'),
        copies: 4,
        available: 2,
        genreId: mystery.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Gone Girl',
        author: 'Gillian Flynn',
        isbn: '978-0307588371',
        publishedAt: new Date('2012-06-05'),
        copies: 3,
        available: 1,
        genreId: mystery.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        isbn: '978-1250301697',
        publishedAt: new Date('2019-02-05'),
        copies: 4,
        available: 3,
        genreId: mystery.id,
      },
    }),
  ]);

  console.log(`✅ Created ${books.length} books`);

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'librarian@library.com',
        name: 'Alice Librarian',
        role: 'LIBRARIAN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'patron@example.com',
        name: 'Bob Patron',
        role: 'PATRON',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.reader@example.com',
        name: 'Jane Reader',
        role: 'PATRON',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create some borrow records
  const [librarian, bob, jane] = users;
  const borrowRecords = await Promise.all([
    prisma.borrowRecord.create({
      data: {
        userId: bob.id,
        bookId: books[0].id, // The Great Gatsby
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      },
    }),
    prisma.borrowRecord.create({
      data: {
        userId: jane.id,
        bookId: books[4].id, // Dune
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.borrowRecord.create({
      data: {
        userId: bob.id,
        bookId: books[9].id, // The Name of the Wind
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${borrowRecords.length} borrow records`);

  // Create review records (patrons rating books)
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: bob.id,
        bookId: books[0].id, // The Great Gatsby
        rating: 5,
        comment: 'A masterpiece of American literature. Fitzgerald\'s prose is unmatched.',
      },
    }),
    prisma.review.create({
      data: {
        userId: jane.id,
        bookId: books[0].id, // The Great Gatsby
        rating: 4,
        comment: 'Beautifully written, though the pacing felt slow at times.',
      },
    }),
    prisma.review.create({
      data: {
        userId: bob.id,
        bookId: books[4].id, // Dune
        rating: 5,
        comment: 'The world-building is incredible. A must-read for any sci-fi fan.',
      },
    }),
    prisma.review.create({
      data: {
        userId: jane.id,
        bookId: books[4].id, // Dune
        rating: 5,
        comment: 'Absolutely brilliant. The political intrigue keeps you hooked.',
      },
    }),
    prisma.review.create({
      data: {
        userId: bob.id,
        bookId: books[7].id, // Sapiens
        rating: 4,
        comment: 'Fascinating overview of human history. Some claims felt oversimplified.',
      },
    }),
    prisma.review.create({
      data: {
        userId: jane.id,
        bookId: books[10].id, // The Name of the Wind
        rating: 5,
        comment: 'Rothfuss writes like poetry. Kvothe is an unforgettable protagonist.',
      },
    }),
    prisma.review.create({
      data: {
        userId: bob.id,
        bookId: books[13].id, // The Girl with the Dragon Tattoo
        rating: 4,
        comment: 'Gripping thriller with complex characters. The mystery kept me guessing.',
      },
    }),
    prisma.review.create({
      data: {
        userId: jane.id,
        bookId: books[1].id, // To Kill a Mockingbird
        rating: 5,
        comment: 'Timeless and powerful. Atticus Finch is the hero we all need.',
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
