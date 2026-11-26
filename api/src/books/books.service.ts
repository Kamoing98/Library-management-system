import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    await this.assertGenreExists(dto.genreId);
    try {
      return await this.prisma.book.create({
        data: {
          title: dto.title,
          author: dto.author,
          isbn: dto.isbn,
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
          copies: dto.totalCopies,
          available: dto.totalCopies,
          genreId: dto.genreId,
        },
        include: { genre: true },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async findAll(params: {
    genreId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);

    const where: Prisma.BookWhereInput = {};
    if (params.genreId) where.genreId = params.genreId;
    if (params.search?.trim()) {
      const term = params.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { author: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        include: { genre: true },
        orderBy: { title: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async update(id: string, dto: UpdateBookDto) {
    const existing = await this.findOne(id);
    if (dto.genreId) await this.assertGenreExists(dto.genreId);

    const data: Prisma.BookUncheckedUpdateInput = {
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      genreId: dto.genreId,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
    };

    if (dto.totalCopies !== undefined) {
      const borrowed = existing.copies - existing.available;
      if (dto.totalCopies < borrowed)
        throw new BadRequestException(
          `totalCopies cannot be less than the ${borrowed} copies currently borrowed`,
        );
      data.copies = dto.totalCopies;
      data.available = dto.totalCopies - borrowed;
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data,
        include: { genre: true },
      });
    } catch (e) {
      this.handleError(e, id);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (e) {
      this.handleError(e, id);
    }
  }

  private async assertGenreExists(genreId: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) throw new NotFoundException(`Genre ${genreId} not found`);
  }

  private handleError(e: unknown, id?: string): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002')
        throw new ConflictException('A book with that ISBN already exists');
      if (e.code === 'P2025')
        throw new NotFoundException(`Book ${id} not found`);
    }
    throw e;
  }
}
