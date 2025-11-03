"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvImportProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const fast_csv_1 = require("fast-csv");
let CsvImportProcessor = class CsvImportProcessor extends bullmq_1.WorkerHost {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        const { datasetId, filePath } = job.data;
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        await this.prisma.dataset.update({
            where: { id: datasetId },
            data: {
                status: client_1.DatasetStatus.PROCESSING,
                storedFilePath: filePath,
                progress: 0,
                errorText: null,
            },
        });
        const stream = fs.createReadStream(filePath);
        const csvStream = (0, fast_csv_1.parse)({ headers: true });
        const BATCH_SIZE = 1000;
        const buffer = [];
        let columns = null;
        let count = 0;
        return new Promise((resolve, reject) => {
            csvStream
                .on('error', async (err) => {
                await this.prisma.dataset.update({
                    where: { id: datasetId },
                    data: {
                        status: client_1.DatasetStatus.FAILED,
                        errorText: err.message,
                        progress: 0,
                    },
                });
                reject(err);
            })
                .on('data', async (row) => {
                if (!columns) {
                    const firstCols = Object.keys(row);
                    const looksBad = firstCols.some((c) => c === '' || /^[0-9]+$/.test(c));
                    if (looksBad || firstCols.length === 0) {
                        await this.prisma.dataset.update({
                            where: { id: datasetId },
                            data: {
                                status: client_1.DatasetStatus.FAILED,
                                errorText: 'CSV не содержит заголовков (первую строку)',
                                progress: 0,
                            },
                        });
                        csvStream.destroy();
                        return;
                    }
                    columns = firstCols;
                }
                buffer.push({
                    datasetId,
                    data: row,
                });
                count++;
                if (buffer.length >= BATCH_SIZE) {
                    csvStream.pause();
                    this.prisma.datasetRow
                        .createMany({ data: buffer.splice(0, buffer.length) })
                        .then(() => csvStream.resume())
                        .catch(async (e) => {
                        await this.prisma.dataset.update({
                            where: { id: datasetId },
                            data: {
                                status: client_1.DatasetStatus.FAILED,
                                errorText: e.message,
                            },
                        });
                        reject(e);
                    });
                }
            })
                .on('end', async () => {
                if (buffer.length > 0) {
                    await this.prisma.datasetRow.createMany({
                        data: buffer,
                    });
                }
                await this.prisma.dataset.update({
                    where: { id: datasetId },
                    data: {
                        status: client_1.DatasetStatus.READY,
                        rowsCount: count,
                        columns: columns ?? [],
                        progress: 100,
                    },
                });
                resolve();
            });
            stream.pipe(csvStream);
        });
    }
};
exports.CsvImportProcessor = CsvImportProcessor;
exports.CsvImportProcessor = CsvImportProcessor = __decorate([
    (0, bullmq_1.Processor)('csv-import'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CsvImportProcessor);
//# sourceMappingURL=csv-import.processor.js.map