import { Module } from '@nestjs/common';
import { DatasetsController } from './datasets.controller';
import { ExportController } from './export.controller';

@Module({
  controllers: [DatasetsController, ExportController],
})
export class DatasetsModule {}
