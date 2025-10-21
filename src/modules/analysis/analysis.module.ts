import { Module } from '@nestjs/common';
import { AnalysisService } from './application/analysis.service';
import { StorageModule } from '../storage/storage.module';
import { OpenAIAdapter } from './adapters/llm/openai.adapter';
import { SentimentService } from './services/sentiment/sentiment.service';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './adapters/llm/openai.config';
import { DevAnalysisController } from './presentation/dev-analysis-controller';

@Module({
  providers: [AnalysisService, OpenAIAdapter, SentimentService],
  imports: [StorageModule,
    ConfigModule.forFeature(openaiConfig)
  ],
  controllers: [
    DevAnalysisController
  ],

  exports: [AnalysisService]
})
export class AnalysisModule { }
