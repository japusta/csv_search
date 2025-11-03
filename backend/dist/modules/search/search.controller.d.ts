import { SearchRepository } from './search.repository';
export declare class SearchController {
    private readonly repo;
    constructor(repo: SearchRepository);
    search(datasetId: string, field: string | string[], value: string | string[], mode?: 'and' | 'or', page?: string, limit?: string, sortField?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        total: number;
        page: number;
        limit: number;
        items: any[];
    }>;
}
