import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ExportController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    export(datasetId: string, field: string | string[], value: string | string[], mode: 'and' | 'or', res: Response): Promise<void>;
}
