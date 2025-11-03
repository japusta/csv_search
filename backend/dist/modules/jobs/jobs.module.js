"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_module_1 = require("../../prisma/prisma.module");
const datasets_module_1 = require("../datasets/datasets.module");
const rows_module_1 = require("../rows/rows.module");
const csv_import_processor_1 = require("./processors/csv-import.processor");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'csv-import',
            }),
            prisma_module_1.PrismaModule,
            datasets_module_1.DatasetsModule,
            rows_module_1.RowsModule,
        ],
        providers: [csv_import_processor_1.CsvImportProcessor],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map