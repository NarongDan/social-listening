import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RawData, RawDataSchema } from './domain/schemas/raw-data.schema';
import { RAW_DATA_REPOSITORY } from './domain/interfaces/raw-data.interface';
import { RawDataRepository } from './domain/repositories/raw-data.repository';
import { ProcessedData, ProcessedDataSchema } from './domain/schemas/processed-data.schema';
import { PROCESSED_DATA_REPOSITORY } from './domain/interfaces/processed-data.interface';
import { ProcessedDataRepository } from './domain/repositories/processed-data.repository';
import { SentimentAnalysis, SentimentAnalysisSchema } from './domain/schemas/sentiment-analysis.schema';
import { SENTIMENT_ANALYSIS_REPOSITORY } from './domain/interfaces/sentiment-analysis.interface';
import { SentimentAnalysisRepository } from './domain/repositories/sentiment-analysis.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI')!,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20,
        minPoolSize: 5,

      }),
    }),
    MongooseModule.forFeature([
      { name: RawData.name, schema: RawDataSchema },
      { name: ProcessedData.name, schema: ProcessedDataSchema },
      { name: SentimentAnalysis.name, schema: SentimentAnalysisSchema },
    ]
    ),
  ],

  providers: [StorageService,
    { provide: RAW_DATA_REPOSITORY, useClass: RawDataRepository },
    { provide: PROCESSED_DATA_REPOSITORY, useClass: ProcessedDataRepository },
    { provide: SENTIMENT_ANALYSIS_REPOSITORY, useClass: SentimentAnalysisRepository },

  ],
  exports: [StorageService],
})
export class StorageModule { }
