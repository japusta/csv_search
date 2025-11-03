import { PrismaService } from '../../prisma/prisma.service';
import { Queue } from 'bullmq';
export declare class UploadService {
    private readonly prisma;
    private readonly csvQueue;
    constructor(prisma: PrismaService, csvQueue: Queue);
    handleUpload(file: Express.Multer.File): Promise<string>;
}
