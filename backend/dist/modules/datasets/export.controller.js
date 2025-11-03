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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_guard_1 = require("../../security/auth.guard");
let ExportController = class ExportController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async export(datasetId, field, value, mode = 'and', res) {
        const fields = Array.isArray(field) ? field : field ? [field] : [];
        const values = Array.isArray(value) ? value : value ? [value] : [];
        const conditions = fields
            .map((f, i) => ({ field: f, value: values[i] ?? '' }))
            .filter((c) => c.field && c.value);
        let rows;
        if (conditions.length === 0) {
            rows = await this.prisma.datasetRow.findMany({
                where: { datasetId },
                orderBy: { id: 'asc' },
            });
        }
        else {
            const params = [datasetId];
            const whereParts = [];
            conditions.forEach((c) => {
                params.push(c.field);
                params.push(`%${c.value}%`);
                const f = `$${params.length - 1}`;
                const v = `$${params.length}`;
                whereParts.push(`data ->> ${f} ILIKE ${v}`);
            });
            const joiner = mode === 'or' ? ' OR ' : ' AND ';
            const whereSql = whereParts.join(joiner);
            rows = await this.prisma.$queryRawUnsafe(`
        SELECT *
        FROM "DatasetRow"
        WHERE "datasetId" = $1
          AND ( ${whereSql} )
        ORDER BY "id"
        `, ...params);
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
        if (!rows.length) {
            res.send('');
            return;
        }
        const columns = Object.keys(rows[0].data);
        const csvLines = [];
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
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('datasetId')),
    __param(1, (0, common_1.Query)('field')),
    __param(2, (0, common_1.Query)('value')),
    __param(3, (0, common_1.Query)('mode')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "export", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportController);
//# sourceMappingURL=export.controller.js.map