import { PrismaService } from '../../prisma/prisma.service';
export declare class RowsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRows(datasetId: string, page?: string, limit?: string, sortField?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        total: number;
        page: number;
        limit: number;
        items: any[];
    }>;
}
