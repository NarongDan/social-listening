import { Module } from '@nestjs/common';
import { DataCollectionService } from './application/data-collection.service';
import { StorageModule } from '../storage/storage.module';
import { ProcessingModule } from '../processing/processing.module';
import { HttpModule } from '@nestjs/axios';
import { BrightdataClient } from './adapters/brightdata/brightdata.client';
import { ConfigModule } from '@nestjs/config';
import brightdataConfig from './adapters/brightdata/brightdata.config';
import { FacebookService } from './providers/facebook/facebook.service';
import { DevDataCollectionController } from './presentation/dev-data-collection.controller';


@Module({
  providers: [DataCollectionService, BrightdataClient, FacebookService],
  imports: [ProcessingModule, StorageModule, HttpModule, ConfigModule.forFeature(brightdataConfig)],
  exports: [DataCollectionService],
  controllers: [DevDataCollectionController],

})
export class DataCollectionModule { }
