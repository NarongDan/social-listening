import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [ProcessingService],
  imports: [StorageModule],
  exports: [ProcessingService],
})
export class ProcessingModule { }
