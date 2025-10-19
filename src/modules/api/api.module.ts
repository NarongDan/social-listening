import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { DataCollectionModule } from '../data-collection/data-collection.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  providers: [ApiService],
  controllers: [ApiController],
  imports: [
    DataCollectionModule,
    AnalysisModule,
  ],

})
export class ApiModule { }
