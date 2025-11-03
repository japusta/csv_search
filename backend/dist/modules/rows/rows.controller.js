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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_guard_1 = require("../../security/auth.guard");
let RowsController = class RowsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRows(datasetId, page = '1', limit = '100', sortField, sortOrder = 'asc') {
        const p = Number(page);
        const l = Number(limit);
        if (sortField) {
            const order = sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            const offset = (p - 1) * l;
            const rows = await this.prisma.$queryRawUnsafe(`
        SELECT *
        FROM "DatasetRow"
        WHERE "datasetId" = $1
        ORDER BY data ->> $2 ${order}
        LIMIT ${l} OFFSET ${offset}
        `, datasetId, sortField);
            const totalRes = await this.prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::bigint AS count
        FROM "DatasetRow"
        WHERE "datasetId" = $1
        `, datasetId);
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
};
exports.RowsController = RowsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('datasetId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('sortField')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], RowsController.prototype, "getRows", null);
exports.RowsController = RowsController = __decorate([
    (0, common_1.Controller)('rows'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RowsController);
//# sourceMappingURL=rows.controller.js.map