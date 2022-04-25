import { Module } from '@nestjs/common';

import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { S3ConfigProvider } from './S3ConfigProvider';

@Module({
  imports: [S3ConfigProvider],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
