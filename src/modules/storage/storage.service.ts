import { Inject, Injectable } from '@nestjs/common';
import { RAW_DATA_REPOSITORY } from './domain/interfaces/raw-data.interface';
import type { IRawDataRepository } from './domain/interfaces/raw-data.interface';
import { NewRawData } from './domain/types/raw-data.types';
import { RawData } from './domain/schemas/raw-data.schema';
import { FilterQuery } from 'mongoose';

@Injectable()
export class StorageService {

    constructor(
        @Inject(RAW_DATA_REPOSITORY)
        private readonly rawDataRepository: IRawDataRepository
    ) { }

    saveRawData(doc: NewRawData): Promise<RawData> {
        return this.rawDataRepository.insert(doc);
    }

    saveManyRawData(docs: NewRawData[]): Promise<{ inserted: number }> {
        return this.rawDataRepository.insertMany(docs);
    }

    findRawData(filter: FilterQuery<RawData>): Promise<RawData | null> {
        return this.rawDataRepository.findOne(filter);
    }

    updateOneRawData(filter: FilterQuery<RawData>, doc: NewRawData): Promise<RawData | null> {
        return this.rawDataRepository.updateOneRawData(filter, doc);

    }
    deleteOneRawData(filter: FilterQuery<RawData>): Promise<RawData | null> {
        return this.rawDataRepository.deleteOneRawData(filter);
    }

}
