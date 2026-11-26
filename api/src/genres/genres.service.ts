import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({ data: dto });
    } catch (e) {
      this.handleError(e);
    }
  }

  findAll() {
    return this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) throw new NotFoundException(`Genre ${id} not found`);
    return genre;
  }

  async update(id: string, dto: UpdateGenreDto) {
    try {
      return await this.prisma.genre.update({ where: { id }, data: dto });
    } catch (e) {
      this.handleError(e, id);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.genre.delete({ where: { id } });
    } catch (e) {
      this.handleError(e, id);
    }
  }

  private handleError(e: unknown, id?: string): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002')
        throw new ConflictException('A genre with that name already exists');
      if (e.code === 'P2025')
        throw new NotFoundException(`Genre ${id} not found`);
      if (e.code === 'P2003')
        throw new ConflictException(
          'Genre still has books; reassign or delete them first',
        );
    }
    throw e;
  }
}
