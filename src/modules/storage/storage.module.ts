import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RawData, RawDataSchema } from './domain/schemas/raw-data.schema';
import { RAW_DATA_REPOSITORY } from './domain/interfaces/raw-data.interface';
import { RawDataRepository } from './domain/repositories/raw-data.repository';

@Module({
  imports: [

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')!,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 20,
        minPoolSize: 5,

      }),
    }),
    MongooseModule.forFeature([
      { name: RawData.name, schema: RawDataSchema },
    ]
    ),
  ],

  providers: [StorageService,
    { provide: RAW_DATA_REPOSITORY, useClass: RawDataRepository },

  ],
  exports: [StorageService],
})
export class StorageModule { }
