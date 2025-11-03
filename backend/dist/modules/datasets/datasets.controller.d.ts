import { PrismaService } from '../../prisma/prisma.service';
export declare class DatasetsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        originalFilename: string;
        storedFilePath: string | null;
        rowsCount: number;
        columns: import("@prisma/client/runtime/library").JsonValue | null;
        status: import(".prisma/client").$Enums.DatasetStatus;
        progress: number;
        errorText: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        originalFilename: string;
        storedFilePath: string | null;
        rowsCount: number;
        columns: import("@prisma/client/runtime/library").JsonValue | null;
        status: import(".prisma/client").$Enums.DatasetStatus;
        progress: number;
        errorText: string | null;
        createdAt: Date;
    }>;
}
