import { Module } from '@nestjs/common';
import { AnalysisService } from './application/analysis.service';
import { StorageModule } from '../storage/storage.module';
import { OpenAIAdapter } from './adapters/llm/openai.adapter';
import { SentimentService } from './services/sentiment/sentiment.service';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './adapters/llm/openai.config';
import { DevAnalysisController } from './presentation/dev-analysis-controller';
import { BullModule } from '@nestjs/bullmq';
import { BullQueueModule } from '../../shared/queue/bull.config';
import { AnalysisConsumer } from './adapters/queues/analysis.consumer';

@Module({
  providers: [AnalysisService, OpenAIAdapter, SentimentService, AnalysisConsumer],
  imports: [BullQueueModule,
    StorageModule,
    ConfigModule.forFeature(openaiConfig),
    BullModule.registerQueue({ name: 'analysis' }),

  ],
  controllers: [
    DevAnalysisController
  ],

  exports: [AnalysisService]
})
export class AnalysisModule { }
