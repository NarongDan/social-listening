// src/modules/storage/domain/repositories/raw-data.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { RawData, } from '../schemas/raw-data.schema';
import { NewRawData } from '../types/raw-data.types';
import { IRawDataRepository } from '../interfaces/raw-data.interface';


@Injectable()
export class RawDataRepository implements IRawDataRepository {
    constructor(
        @InjectModel(RawData.name)
        private readonly rawModel: Model<RawData>,
    ) { }

    async insert(doc: NewRawData): Promise<RawData> {
        const created = await this.rawModel.create(doc);
        return created
    }

    /**
     * สร้างหลายเอกสารแบบ batch
     * - ใช้ ordered:false เพื่อให้ไม่หยุดเมื่อเจอเอกสารซ้ำ (หากมี unique index)
     * - คืนจำนวนที่ใส่ได้จริง
     */
    async insertMany(docs: NewRawData[]): Promise<{ inserted: number }> {
        if (!docs?.length) return { inserted: 0 };

        // ใช้ native driver เพื่อผลลัพธ์แบบ InsertManyResult
        const res = await this.rawModel.collection.insertMany(docs as any[], { ordered: false });

        const inserted =
            (res as any).insertedCount ??
            (res.insertedIds ? Object.keys(res.insertedIds).length : 0);

        return { inserted };
    }

    async findOne(
        filter: FilterQuery<RawData>,

    ): Promise<RawData | null> {
        const doc = await this.rawModel
            .findOne(filter)


        return doc;
    }

    async updateOneRawData(filter: FilterQuery<RawData>, doc: NewRawData): Promise<RawData | null> {
        const updated = await this.rawModel.findOneAndUpdate(filter, doc, { new: true });
        return updated
    }

    async deleteOneRawData(filter: FilterQuery<RawData>): Promise<RawData | null> {
        const deleted = await this.rawModel.findOneAndDelete(filter);
        return deleted;
    }
}
