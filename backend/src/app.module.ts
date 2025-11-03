import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { UploadModule } from './modules/upload/upload.module';
import { DatasetsModule } from './modules/datasets/datasets.module';
import { RowsModule } from './modules/rows/rows.module';
import { SearchModule } from './modules/search/search.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module'; 

@Module({
  imports: [
    // .env на весь апп
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: +(process.env.REDIS_PORT || 6379),
      },
    }),

    UploadModule,
    DatasetsModule,
    RowsModule,
    SearchModule,
    AdminModule,
    HealthModule,
    JobsModule, 
  ],
})
export class AppModule {}
