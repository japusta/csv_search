import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { DatasetStatus } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'fast-csv';

@Processor('csv-import')
export class CsvImportProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ datasetId: string; filePath: string }>): Promise<void> {
    const { datasetId, filePath } = job.data;

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    await this.prisma.dataset.update({
      where: { id: datasetId },
      data: {
        status: DatasetStatus.PROCESSING,
        storedFilePath: filePath,
        progress: 0,
        errorText: null,
      },
    });

    const stream = fs.createReadStream(filePath);
    const csvStream = parse({ headers: true });

    const BATCH_SIZE = 1000;
    const buffer: any[] = [];
    let columns: string[] | null = null;
    let count = 0;

    return new Promise<void>((resolve, reject) => {
      csvStream
        .on('error', async (err) => {
          await this.prisma.dataset.update({
            where: { id: datasetId },
            data: {
              status: DatasetStatus.FAILED,
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
                  status: DatasetStatus.FAILED,
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
                    status: DatasetStatus.FAILED,
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
              status: DatasetStatus.READY,
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
}
