import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../security/auth.guard';

@Controller('export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async export(
    @Query('datasetId') datasetId: string,
    @Query('field') field: string | string[],
    @Query('value') value: string | string[],
    @Query('mode') mode: 'and' | 'or' = 'and',
    @Res() res: Response,
  ) {
    const fields = Array.isArray(field) ? field : field ? [field] : [];
    const values = Array.isArray(value) ? value : value ? [value] : [];
    const conditions = fields
      .map((f, i) => ({ field: f, value: values[i] ?? '' }))
      .filter((c) => c.field && c.value);

    let rows: any[];

    if (conditions.length === 0) {
      rows = await this.prisma.datasetRow.findMany({
        where: { datasetId },
        orderBy: { id: 'asc' },
      });
    } else {
      const params: any[] = [datasetId];
      const whereParts: string[] = [];
      conditions.forEach((c) => {
        params.push(c.field);
        params.push(`%${c.value}%`);
        const f = `$${params.length - 1}`;
        const v = `$${params.length}`;
        whereParts.push(`data ->> ${f} ILIKE ${v}`);
      });
      const joiner = mode === 'or' ? ' OR ' : ' AND ';
      const whereSql = whereParts.join(joiner);

      rows = await this.prisma.$queryRawUnsafe<any[]>(
        `
        SELECT *
        FROM "DatasetRow"
        WHERE "datasetId" = $1
          AND ( ${whereSql} )
        ORDER BY "id"
        `,
        ...params,
      );
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');

    if (!rows.length) {
      res.send('');
      return;
    }

    const columns = Object.keys(rows[0].data);
    const csvLines: string[] = [];
    csvLines.push(columns.join(','));

    for (const r of rows) {
      const line = columns.map((c) => {
        const val = r.data?.[c] ?? '';
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvLines.push(line.join(','));
    }

    res.send(csvLines.join('\n'));
  }
}
