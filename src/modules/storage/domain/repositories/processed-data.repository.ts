// src/modules/storage/domain/repositories/raw-data.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { RawData, } from '../schemas/raw-data.schema';

import { IRawDataRepository } from '../interfaces/raw-data.interface';
import { IProcessedDataRepository } from '../interfaces/processed-data.interface';
import { ProcessedData } from '../schemas/processed-data.schema';


@Injectable()
export class ProcessedDataRepository implements IProcessedDataRepository {
    constructor(
        @InjectModel(ProcessedData.name)
        private readonly rawModel: Model<ProcessedData>,
    ) { }

    async insertProcessedData(doc: ProcessedData): Promise<ProcessedData> {
        const created = await this.rawModel.create(doc);
        return created
    }

    /**
     * สร้างหลายเอกสารแบบ batch
     * - ใช้ ordered:false เพื่อให้ไม่หยุดเมื่อเจอเอกสารซ้ำ (หากมี unique index)
     * - คืนจำนวนที่ใส่ได้จริง
     */
    async insertManyProcessedData(docs: ProcessedData[]): Promise<{ inserted: number }> {
        if (!docs?.length) return { inserted: 0 };

        // ใช้ native driver เพื่อผลลัพธ์แบบ InsertManyResult
        const res = await this.rawModel.collection.insertMany(docs as any[], { ordered: false });

        const inserted =
            (res as any).insertedCount ??
            (res.insertedIds ? Object.keys(res.insertedIds).length : 0);

        return { inserted };
    }

    async findOneProcessedData(
        filter: FilterQuery<ProcessedData>,

    ): Promise<ProcessedData | null> {
        const doc = await this.rawModel
            .findOne(filter)


        return doc;
    }

    async findManyProcessedData(filter: FilterQuery<ProcessedData>): Promise<ProcessedData[]> {
        const docs = await this.rawModel.find(filter);
        return docs
    }

    async updateOneProcessedData(filter: FilterQuery<ProcessedData>, doc: ProcessedData): Promise<ProcessedData | null> {
        const updated = await this.rawModel.findOneAndUpdate(filter, doc, { new: true });
        return updated
    }

    async deleteOneProcessedData(filter: FilterQuery<ProcessedData>): Promise<ProcessedData | null> {
        const deleted = await this.rawModel.findOneAndDelete(filter);
        return deleted;
    }
}
