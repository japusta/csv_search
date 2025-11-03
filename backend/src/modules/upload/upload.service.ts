import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('csv-import')
    private readonly csvQueue: Queue,
  ) {}

  async handleUpload(file: Express.Multer.File): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetPath = path.join(uploadDir, Date.now() + '_' + file.originalname);
    fs.writeFileSync(targetPath, file.buffer);

    const dataset = await this.prisma.dataset.create({
      data: {
        originalFilename: file.originalname,
        storedFilePath: targetPath,
      },
    });

    await this.csvQueue.add('import', {
      datasetId: dataset.id,
      filePath: targetPath,
    });

    return dataset.id;
  }
}
