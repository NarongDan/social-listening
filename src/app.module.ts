import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessingModule } from './modules/processing/processing.module';
import { StorageModule } from './modules/storage/storage.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ApiModule } from './modules/api/api.module';
import { DataCollectionModule } from './modules/data-collection/data-collection.module';

@Module({
  imports: [ProcessingModule, StorageModule, AnalysisModule, ApiModule, DataCollectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
