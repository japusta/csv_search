import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { AuthGuard } from '../../security/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { Express } from 'express'; 

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Throttle({
    // 5 запросов за 60 секунд
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Допускаются только CSV-файлы');
    }

    const datasetId = await this.uploadService.handleUpload(file);
    return { datasetId };
  }
}
