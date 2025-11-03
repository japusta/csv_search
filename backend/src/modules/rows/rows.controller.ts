import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../security/auth.guard';

@Controller('rows')
@UseGuards(AuthGuard)
export class RowsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getRows(
    @Query('datasetId') datasetId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const p = Number(page);
    const l = Number(limit);

    if (sortField) {
      const order = sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      const offset = (p - 1) * l;

      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `
        SELECT *
        FROM "DatasetRow"
        WHERE "datasetId" = $1
        ORDER BY data ->> $2 ${order}
        LIMIT ${l} OFFSET ${offset}
        `,
        datasetId,
        sortField,
      );

      const totalRes = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `
        SELECT COUNT(*)::bigint AS count
        FROM "DatasetRow"
        WHERE "datasetId" = $1
        `,
        datasetId,
      );

      return {
        total: Number(totalRes[0]?.count ?? 0),
        page: p,
        limit: l,
        items: rows,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.datasetRow.findMany({
        where: { datasetId },
        skip: (p - 1) * l,
        take: l,
        orderBy: { id: 'asc' },
      }),
      this.prisma.datasetRow.count({ where: { datasetId } }),
    ]);

    return {
      total,
      page: p,
      limit: l,
      items,
    };
  }
}
