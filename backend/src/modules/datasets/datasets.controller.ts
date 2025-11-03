import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../security/auth.guard';

@Controller('datasets')
@UseGuards(AuthGuard)
export class DatasetsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.dataset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.dataset.findUnique({
      where: { id },
    });
  }
}
