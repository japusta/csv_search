// src/modules/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from '../../prisma/prisma.module';
import { DatasetsModule } from '../datasets/datasets.module';
import { RowsModule } from '../rows/rows.module';

import { CsvImportProcessor } from './processors/csv-import.processor';

@Module({
  imports: [
    // очередь, которую будет есть процессор
    BullModule.registerQueue({
      name: 'csv-import',
    }),

    // сюда подтягиваем PrismaService
    PrismaModule,

    // если в процессоре ты сохраняешь инфу о датасете / строках
    DatasetsModule,
    RowsModule,
  ],
  providers: [CsvImportProcessor],
})
export class JobsModule {}
