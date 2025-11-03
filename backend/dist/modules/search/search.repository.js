"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SearchRepository = class SearchRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchDatasetRows(datasetId, conditions, mode, page, limit, sortField, sortOrder = 'asc') {
        const offset = (page - 1) * limit;
        if (conditions.length === 0) {
            if (sortField) {
                const order = sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
                const rows = await this.prisma.$queryRawUnsafe(`
          SELECT *
          FROM "DatasetRow"
          WHERE "datasetId" = $1
          ORDER BY data ->> $2 ${order}
          LIMIT ${limit} OFFSET ${offset}
          `, datasetId, sortField);
                const totalRes = await this.prisma.$queryRawUnsafe(`
          SELECT COUNT(*)::bigint AS count
          FROM "DatasetRow"
          WHERE "datasetId" = $1
          `, datasetId);
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
        const params = [datasetId];
        const whereParts = [];
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
        const rows = await this.prisma.$queryRawUnsafe(`
      SELECT *
      FROM "DatasetRow"
      WHERE "datasetId" = $1
        AND ( ${whereSql} )
      ${orderSql}
      LIMIT ${limit} OFFSET ${offset}
      `, ...params);
        const countRes = await this.prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::bigint AS count
      FROM "DatasetRow"
      WHERE "datasetId" = $1
        AND ( ${whereSql} )
      `, datasetId, ...params.slice(1, 1 + conditions.length * 2));
        return {
            items: rows,
            total: Number(countRes[0]?.count ?? 0),
        };
    }
};
exports.SearchRepository = SearchRepository;
exports.SearchRepository = SearchRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchRepository);
//# sourceMappingURL=search.repository.js.map