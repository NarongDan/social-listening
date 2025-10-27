import { Inject, Injectable } from '@nestjs/common';
import { RAW_DATA_REPOSITORY } from './domain/interfaces/raw-data.interface';
import type { IRawDataRepository } from './domain/interfaces/raw-data.interface';
import { NewRawData } from './domain/types/raw-data.types';
import { RawData } from './domain/schemas/raw-data.schema';
import { FilterQuery } from 'mongoose';
import { PROCESSED_DATA_REPOSITORY, type IProcessedDataRepository } from './domain/interfaces/processed-data.interface';
import { ProcessedData } from './domain/schemas/processed-data.schema';


@Injectable()
export class StorageService {

    constructor(
        @Inject(RAW_DATA_REPOSITORY)
        private readonly rawDataRepository: IRawDataRepository,
        @Inject(PROCESSED_DATA_REPOSITORY)
        private readonly processedDataRepository: IProcessedDataRepository
    ) { }

    saveRawData(doc: NewRawData): Promise<RawData> {
        return this.rawDataRepository.insertRawData(doc);
    }

    saveManyRawData(docs: NewRawData[]): Promise<{ inserted: number }> {
        return this.rawDataRepository.insertManyRawData(docs);
    }

    findRawData(filter: FilterQuery<RawData>): Promise<RawData | null> {
        return this.rawDataRepository.findOneRawData(filter);
    }

    findManyRawData(filter: FilterQuery<RawData>): Promise<RawData[]> {
        return this.rawDataRepository.findManyRawData(filter);
    }

    updateOneRawData(filter: FilterQuery<RawData>, doc: NewRawData): Promise<RawData | null> {
        return this.rawDataRepository.updateOneRawData(filter, doc);

    }
    deleteOneRawData(filter: FilterQuery<RawData>): Promise<RawData | null> {
        return this.rawDataRepository.deleteOneRawData(filter);
    }


    insertProcessedData(doc: ProcessedData): Promise<ProcessedData> {
        return this.processedDataRepository.insertProcessedData(doc);
    }

    saveManyProcessedData(docs: ProcessedData[]): Promise<{ inserted: number }> {
        return this.processedDataRepository.insertManyProcessedData(docs);
    }

    findProcessedData(filter: FilterQuery<ProcessedData>): Promise<ProcessedData | null> {
        return this.processedDataRepository.findOneProcessedData(filter);
    }

    findManyProcessedData(filter: FilterQuery<ProcessedData>): Promise<ProcessedData[]> {
        return this.processedDataRepository.findManyProcessedData(filter);
    }

    updateOneProcessedData(filter: FilterQuery<ProcessedData>, doc: ProcessedData): Promise<ProcessedData | null> {
        return this.processedDataRepository.updateOneProcessedData(filter, doc);

    }
    deleteOneProcessedData(filter: FilterQuery<ProcessedData>): Promise<ProcessedData | null> {
        return this.processedDataRepository.deleteOneProcessedData(filter);
    }

}
