import { useState } from 'react';
import { BookOpen, Database, Users, Layers, FileCode, Server, ChevronRight, Library, Shield, BookMarked } from 'lucide-react';

type Tab = 'overview' | 'schema' | 'seed' | 'service' | 'decisions';

const genres = [
  { name: 'Fiction', slug: 'fiction', bookCount: 4 },
  { name: 'Science Fiction', slug: 'science-fiction', bookCount: 3 },
  { name: 'Non-Fiction', slug: 'non-fiction', bookCount: 3 },
  { name: 'Fantasy', slug: 'fantasy', bookCount: 3 },
  { name: 'Mystery', slug: 'mystery', bookCount: 3 },
];

const books = [
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', isbn: '978-0743273565' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', genre: 'Fiction', isbn: '978-0061120084' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Fiction', isbn: '978-0141439518' },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', genre: 'Fiction', isbn: '978-0060883287' },
  { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction', isbn: '978-0441013593' },
  { title: 'Neuromancer', author: 'William Gibson', genre: 'Science Fiction', isbn: '978-0441478125' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', genre: 'Science Fiction', isbn: '978-0441478125' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'Non-Fiction', isbn: '978-0062316097' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', genre: 'Non-Fiction', isbn: '978-0374533557' },
  { title: 'Educated', author: 'Tara Westover', genre: 'Non-Fiction', isbn: '978-0399590504' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy', isbn: '978-0756404741' },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', genre: 'Fantasy', isbn: '978-0553593716' },
  { title: 'The Way of Kings', author: 'Brandon Sanderson', genre: 'Fantasy', isbn: '978-0765365279' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', genre: 'Mystery', isbn: '978-0307949486' },
  { title: 'Gone Girl', author: 'Gillian Flynn', genre: 'Mystery', isbn: '978-0307588371' },
  { title: 'The Silent Patient', author: 'Alex Michaelides', genre: 'Mystery', isbn: '978-1250301697' },
];

const schemaCode = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  PATRON
  LIBRARIAN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(PATRON)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  borrowedBooks BorrowRecord[]
  @@map("users")
}

model Genre {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique
  books Book[]
  @@map("genres")
}

model Book {
  id          String   @id @default(uuid())
  title       String
  author      String
  isbn        String   @unique
  publishedAt DateTime?
  copies      Int      @default(1)
  available   Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  genreId     String
  genre       Genre    @relation(fields: [genreId], references: [id])
  borrowRecords BorrowRecord[]
  @@map("books")
}

model BorrowRecord {
  id         String   @id @default(uuid())
  borrowedAt DateTime @default(now())
  dueDate    DateTime
  returnedAt DateTime?
  userId String
  user   User   @relation(fields: [userId], references: [id])
  bookId String
  book   Book   @relation(fields: [bookId], references: [id])
  @@map("borrow_records")
}`;

const serviceCode = `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}`;

function OverviewTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<BookOpen className="w-6 h-6" />} label="Books" value="16" color="blue" />
        <StatCard icon={<Layers className="w-6 h-6" />} label="Genres" value="5" color="purple" />
        <StatCard icon={<Users className="w-6 h-6" />} label="Users" value="3" color="green" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Entity Relationship Diagram
        </h3>
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <ERDBlock
            title="User"
            fields={['id: UUID', 'email: String', 'name: String', 'role: Role']}
            color="indigo"
          />
          <div className="flex items-center">
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
          <ERDBlock
            title="BorrowRecord"
            fields={['id: UUID', 'borrowedAt: DateTime', 'dueDate: DateTime', 'returnedAt: DateTime?']}
            color="amber"
          />
          <div className="flex items-center">
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
          <ERDBlock
            title="Book"
            fields={['id: UUID', 'title: String', 'author: String', 'isbn: String', 'genreId: FK']}
            color="blue"
          />
          <div className="flex items-center">
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
          <ERDBlock
            title="Genre"
            fields={['id: UUID', 'name: String', 'slug: String']}
            color="purple"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Role-Based Access
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">LIBRARIAN</span>
              <span className="text-sm text-gray-700">Full CRUD on books, manage borrows</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">PATRON</span>
              <span className="text-sm text-gray-700">Browse books, borrow/return</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            Tech Stack
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Backend', value: 'NestJS + Prisma' },
              { label: 'Database', value: 'PostgreSQL' },
              { label: 'Frontend', value: 'React + TypeScript' },
              { label: 'Styling', value: 'Tailwind CSS' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SchemaTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">api/prisma/schema.prisma</h3>
        </div>
        <pre className="p-6 bg-gray-900 text-gray-100 overflow-x-auto text-sm leading-relaxed">
          <code>{schemaCode}</code>
        </pre>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HighlightCard
            title="Role Enum"
            description="PATRON and LIBRARIAN roles for authorization"
            icon={<Shield className="w-5 h-5" />}
          />
          <HighlightCard
            title="Book → Genre Relation"
            description="genreId foreign key with @relation directive"
            icon={<BookMarked className="w-5 h-5" />}
          />
          <HighlightCard
            title="User Model"
            description="UUID primary key, unique email, role-based access"
            icon={<Users className="w-5 h-5" />}
          />
          <HighlightCard
            title="BorrowRecord"
            description="Tracks patron-book borrowing with due dates"
            icon={<BookOpen className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
}

function SeedTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {genres.map((genre) => (
          <div key={genre.slug} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{genre.bookCount}</div>
            <div className="text-sm text-gray-600 mt-1">{genre.name}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Seeded Books ({books.length} total)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {books.map((book, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{book.title}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{book.author}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                      {book.genre}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">{book.isbn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ServiceTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">api/src/prisma/prisma.service.ts</h3>
        </div>
        <pre className="p-6 bg-gray-900 text-gray-100 overflow-x-auto text-sm leading-relaxed">
          <code>{serviceCode}</code>
        </pre>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Architecture</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-bold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Extends PrismaClient</h4>
              <p className="text-sm text-gray-600 mt-1">
                Inherits all Prisma query methods (findMany, create, update, delete, etc.)
                for type-safe database operations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-bold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Implements OnModuleInit</h4>
              <p className="text-sm text-gray-600 mt-1">
                NestJS lifecycle hook that fires when the module is initialized,
                ensuring the database connection is established before any requests.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-bold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Calls this.$connect()</h4>
              <p className="text-sm text-gray-600 mt-1">
                Explicitly connects to the database during module initialization,
                ensuring the connection pool is ready before the application starts serving requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-indigo-600" />
          Schema Decisions: Why Book References Genre
        </h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-4">
            The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-700 text-sm font-mono">Book</code> model
            references <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-700 text-sm font-mono">Genre</code> through
            a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-700 text-sm font-mono">genreId</code> foreign
            key using Prisma's <code className="bg-gray-100 px-1.5 py-0.5 rounded text-indigo-700 text-sm font-mono">@relation</code> directive,
            rather than embedding genre information directly within the Book model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <DecisionCard
            number={1}
            title="Data Normalization"
            description="Eliminates redundancy. A genre name update requires changing one row, not thousands of book records."
          />
          <DecisionCard
            number={2}
            title="Referential Integrity"
            description="Foreign key constraints ensure every book references a valid genre. onDelete: Restrict prevents accidental genre deletion."
          />
          <DecisionCard
            number={3}
            title="Query Flexibility"
            description="Simple WHERE and GROUP BY operations for finding books by genre or counting books per genre."
          />
          <DecisionCard
            number={4}
            title="Scalability"
            description="Genre table stays small and cacheable. Adding genres is a single INSERT, not a bulk update."
          />
          <DecisionCard
            number={5}
            title="Extensibility"
            description="Genre can gain new fields (descriptions, icons, hierarchies) without touching the Book model."
          />
          <DecisionCard
            number={6}
            title="Many-to-Many Ready"
            description="Normalized design easily evolves to support books belonging to multiple genres via a join table."
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
        <h4 className="font-semibold text-indigo-900 mb-2">💡 Key Takeaway</h4>
        <p className="text-sm text-indigo-800">
          By using a foreign key relation instead of embedding, we follow database normalization best practices
          while maintaining the flexibility to evolve the schema as requirements change. The <code className="bg-white/60 px-1 py-0.5 rounded font-mono text-xs">@relation(fields: [genreId], references: [id])</code> directive
          in Prisma makes this relationship explicit and type-safe.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm opacity-75">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ERDBlock({ title, fields, color }: { title: string; fields: string[]; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50',
    amber: 'border-amber-200 bg-amber-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
  };

  return (
    <div className={`rounded-lg border-2 p-4 min-w-[160px] ${colors[color]}`}>
      <div className="font-bold text-sm text-gray-900 mb-2 text-center">{title}</div>
      <div className="space-y-1">
        {fields.map((field) => (
          <div key={field} className="text-xs text-gray-600 font-mono">{field}</div>
        ))}
      </div>
    </div>
  );
}

function HighlightCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      <div className="text-indigo-600 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function DecisionCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
          {number}
        </span>
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Library className="w-4 h-4" /> },
    { id: 'schema', label: 'Schema', icon: <Database className="w-4 h-4" /> },
    { id: 'seed', label: 'Seed Data', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'service', label: 'Service', icon: <Server className="w-4 h-4" /> },
    { id: 'decisions', label: 'Decisions', icon: <FileCode className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Library Management System</h1>
              <p className="text-xs text-gray-500">NestJS + Prisma + PostgreSQL</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'schema' && <SchemaTab />}
        {activeTab === 'seed' && <SeedTab />}
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'decisions' && <DecisionsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Library Management System — Schema & Architecture Documentation
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Database className="w-4 h-4" /> Prisma
              </span>
              <span className="flex items-center gap-1">
                <Server className="w-4 h-4" /> NestJS
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4" /> PostgreSQL
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
