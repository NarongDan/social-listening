import { Inject, Injectable } from '@nestjs/common';
import { RAW_DATA_REPOSITORY } from './domain/interfaces/raw-data.interface';
import type { IRawDataRepository } from './domain/interfaces/raw-data.interface';
import { NewRawData } from './domain/types/raw-data.types';
import { RawData } from './domain/schemas/raw-data.schema';

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

}
