import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type SearchCondition = {
  field: string;
  value: string;
};

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchDatasetRows(
    datasetId: string,
    conditions: SearchCondition[],
    mode: 'and' | 'or',
    page: number,
    limit: number,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const offset = (page - 1) * limit;

    if (conditions.length === 0) {
      if (sortField) {
        const order = sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `
          SELECT *
          FROM "DatasetRow"
          WHERE "datasetId" = $1
          ORDER BY data ->> $2 ${order}
          LIMIT ${limit} OFFSET ${offset}
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
        return { items: rows, total: Number(totalRes[0]?.count ?? 0) };
      }

      const [items, total] = await Promise.all([
        this.prisma.datasetRow.findMany({
          where: { datasetId },
          skip: offset,
          take: limit,
          orderBy: { id: 'asc' },
        }),
        this.prisma.datasetRow.count({ where: { datasetId } }),
      ]);
      return { items, total };
    }

    const params: any[] = [datasetId];
    const whereParts: string[] = [];

    conditions.forEach((cond) => {
      params.push(cond.field);
      params.push(`%${cond.value}%`);
      const fieldParam = `$${params.length - 1}`;
      const valueParam = `$${params.length}`;
      whereParts.push(`data ->> ${fieldParam} ILIKE ${valueParam}`);
    });

    const joiner = mode === 'or' ? ' OR ' : ' AND ';
    const whereSql = whereParts.join(joiner);

    let orderSql = 'ORDER BY "id" ASC';
    if (sortField) {
      params.push(sortField);
      orderSql = `ORDER BY data ->> $${params.length} ${sortOrder.toUpperCase()}`;
    }

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT *
      FROM "DatasetRow"
      WHERE "datasetId" = $1
        AND ( ${whereSql} )
      ${orderSql}
      LIMIT ${limit} OFFSET ${offset}
      `,
      ...params,
    );

    const countRes = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `
      SELECT COUNT(*)::bigint AS count
      FROM "DatasetRow"
      WHERE "datasetId" = $1
        AND ( ${whereSql} )
      `,
      datasetId,
      ...params.slice(1, 1 + conditions.length * 2),
    );

    return {
      items: rows,
      total: Number(countRes[0]?.count ?? 0),
    };
  }
}
