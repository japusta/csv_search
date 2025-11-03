import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuthGuard } from '../../security/auth.guard';

@Controller('jobs')
@UseGuards(AuthGuard)
export class JobsController {
  constructor(@InjectQueue('csv-import') private readonly csvQueue: Queue) {}

  @Get()
  async getInfo() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.csvQueue.getWaitingCount(),
      this.csvQueue.getActiveCount(),
      this.csvQueue.getCompletedCount(),
      this.csvQueue.getFailedCount(),
      this.csvQueue.getDelayedCount(),
    ]);
    return {
      queue: 'csv-import',
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }
}
