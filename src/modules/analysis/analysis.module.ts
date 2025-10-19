import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [AnalysisService],
  imports: [StorageModule],
  exports: [AnalysisService]
})
export class AnalysisModule { }
