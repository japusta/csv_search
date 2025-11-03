import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    dbInfo(): Promise<{
        datasets: number;
        rows: number;
        indexes: {
            schemaname: string;
            tablename: string;
            indexname: string;
            indexdef: string;
        }[];
    }>;
}
