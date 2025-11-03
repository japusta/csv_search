import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../security/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db-info')
  async dbInfo() {
    const [datasets, rows, indexes] = await Promise.all([
      this.prisma.dataset.count(),
      this.prisma.datasetRow.count(),
      this.prisma.$queryRawUnsafe<
        { schemaname: string; tablename: string; indexname: string; indexdef: string }[]
      >(
        `
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE tablename IN ('Dataset', 'DatasetRow')
        ORDER BY tablename, indexname;
        `,
      ),
    ]);

    return {
      datasets,
      rows,
      indexes,
    };
  }
}
