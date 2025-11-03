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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_repository_1 = require("./search.repository");
const auth_guard_1 = require("../../security/auth.guard");
let SearchController = class SearchController {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async search(datasetId, field, value, mode = 'and', page = '1', limit = '100', sortField, sortOrder = 'asc') {
        const p = Number(page);
        const l = Number(limit);
        const fields = Array.isArray(field) ? field : field ? [field] : [];
        const values = Array.isArray(value) ? value : value ? [value] : [];
        const conditions = fields.map((f, i) => ({
            field: f,
            value: values[i] ?? '',
        }));
        const { items, total } = await this.repo.searchDatasetRows(datasetId, conditions.filter((c) => c.field && c.value), mode, p, l, sortField, sortOrder);
        return {
            total,
            page: p,
            limit: l,
            items,
        };
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('datasetId')),
    __param(1, (0, common_1.Query)('field')),
    __param(2, (0, common_1.Query)('value')),
    __param(3, (0, common_1.Query)('mode')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('sortField')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [search_repository_1.SearchRepository])
], SearchController);
//# sourceMappingURL=search.controller.js.map