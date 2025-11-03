import { PrismaService } from '../../prisma/prisma.service';
type SearchCondition = {
    field: string;
    value: string;
};
export declare class SearchRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    searchDatasetRows(datasetId: string, conditions: SearchCondition[], mode: 'and' | 'or', page: number, limit: number, sortField?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        items: any[];
        total: number;
    }>;
}
export {};
