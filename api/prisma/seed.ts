import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters due to foreign key constraints)
  await prisma.review.deleteMany();
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
        name: 'Fantasy',
        slug: 'fantasy',
      },
    }),
    prisma.genre.create({
      data: {
        name: 'Nonfiction',
        slug: 'nonfiction',
      },
    }),
  ]);

  const [fiction, sciFi, fantasy, nonfiction] = genres;

  console.log(`✅ Created ${genres.length} genres`);

  // Insert Book rows (at least 15, distributed across genres)
  const books = await Promise.all([
    // Fiction (4 books)
    prisma.book.create({
      data: {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141040349',
        publishedAt: new Date('1813-01-28'),
        copies: 4,
        available: 4,
        genreId: fiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        publishedAt: new Date('1960-07-11'),
        copies: 3,
        available: 3,
        genreId: fiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        publishedAt: new Date('1925-04-10'),
        copies: 5,
        available: 5,
        genreId: fiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        publishedAt: new Date('1949-06-08'),
        copies: 2,
        available: 2,
        genreId: fiction.id,
      },
    }),

    // Science Fiction (4 books)
    prisma.book.create({
      data: {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '9780441172719',
        publishedAt: new Date('1965-08-01'),
        copies: 4,
        available: 4,
        genreId: sciFi.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Neuromancer',
        author: 'William Gibson',
        isbn: '9780441569595',
        publishedAt: new Date('1984-07-01'),
        copies: 3,
        available: 3,
        genreId: sciFi.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Foundation',
        author: 'Isaac Asimov',
        isbn: '9780553293357',
        publishedAt: new Date('1951-05-01'),
        copies: 3,
        available: 3,
        genreId: sciFi.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Left Hand of Darkness',
        author: 'Ursula K. Le Guin',
        isbn: '9780441478125',
        publishedAt: new Date('1969-03-01'),
        copies: 2,
        available: 2,
        genreId: sciFi.id,
      },
    }),

    // Fantasy (4 books)
    prisma.book.create({
      data: {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780261102217',
        publishedAt: new Date('1937-09-21'),
        copies: 5,
        available: 5,
        genreId: fantasy.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        isbn: '9780756404741',
        publishedAt: new Date('2007-03-27'),
        copies: 4,
        available: 4,
        genreId: fantasy.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'A Game of Thrones',
        author: 'George R. R. Martin',
        isbn: '9780553582024',
        publishedAt: new Date('1996-08-01'),
        copies: 5,
        available: 5,
        genreId: fantasy.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Mistborn: The Final Empire',
        author: 'Brandon Sanderson',
        isbn: '9780765311788',
        publishedAt: new Date('2006-07-17'),
        copies: 3,
        available: 3,
        genreId: fantasy.id,
      },
    }),

    // Non-Fiction (4 books)
    prisma.book.create({
      data: {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '9780062316097',
        publishedAt: new Date('2014-02-10'),
        copies: 4,
        available: 4,
        genreId: nonfiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Educated',
        author: 'Tara Westover',
        isbn: '9780399590504',
        publishedAt: new Date('2018-02-20'),
        copies: 3,
        available: 3,
        genreId: nonfiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Immortal Life of Henrietta Lacks',
        author: 'Rebecca Skloot',
        isbn: '9781400052189',
        publishedAt: new Date('2010-02-02'),
        copies: 2,
        available: 2,
        genreId: nonfiction.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        publishedAt: new Date('2018-10-16'),
        copies: 4,
        available: 4,
        genreId: nonfiction.id,
      },
    }),
  ]);

  console.log(`✅ Created ${books.length} books`);

  // Insert User rows (sample data)
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'librarian@example.com',
        name: 'Lena Librarian',
        role: 'LIBRARIAN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'patron1@example.com',
        name: 'Alex Patron',
        role: 'PATRON',
      },
    }),
    prisma.user.create({
      data: {
        email: 'patron2@example.com',
        name: 'Sam Reader',
        role: 'PATRON',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Insert Review rows (sample data)
  await Promise.all([
    prisma.review.create({
      data: {
        userId: users[1].id,
        bookId: books[0].id,
        rating: 5,
        comment: 'Classic and beautifully written.',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        bookId: books[4].id,
        rating: 4,
        comment: 'A rich, immersive world.',
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        bookId: books[8].id,
        rating: 5,
        comment: 'A timeless fantasy adventure.',
      },
    }),
  ]);

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
