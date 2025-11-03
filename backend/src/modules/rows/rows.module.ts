import { Module } from '@nestjs/common';
import { RowsController } from './rows.controller';

@Module({
  controllers: [RowsController],
})
export class RowsModule {}
