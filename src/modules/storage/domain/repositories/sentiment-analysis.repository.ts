import { SentimentAnalysis } from './../schemas/sentiment-analysis.schema';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { RawData, } from '../schemas/raw-data.schema';
import { NewRawData } from '../types/raw-data.types';
import { IRawDataRepository } from '../interfaces/raw-data.interface';
import { ISentimentAnalysisRepository } from '../interfaces/sentiment-analysis.interface';


@Injectable()
export class SentimentAnalysisRepository implements ISentimentAnalysisRepository {
    constructor(
        @InjectModel(SentimentAnalysis.name)
        private readonly sentimentAnalysisModel: Model<SentimentAnalysis>,
    ) { }

    async insertOneSentimentAnalysis(doc: SentimentAnalysis): Promise<SentimentAnalysis> {
        const created = await this.sentimentAnalysisModel.create(doc);
        return created
    }

    // /**
    //  * สร้างหลายเอกสารแบบ batch
    //  * - ใช้ ordered:false เพื่อให้ไม่หยุดเมื่อเจอเอกสารซ้ำ (หากมี unique index)
    //  * - คืนจำนวนที่ใส่ได้จริง
    //  */
    // async insertManyRawData(docs: NewRawData[]): Promise<{ inserted: number }> {
    //     if (!docs?.length) return { inserted: 0 };

    //     // ใช้ native driver เพื่อผลลัพธ์แบบ InsertManyResult
    //     const res = await this.rawModel.collection.insertMany(docs as any[], { ordered: false });

    //     const inserted =
    //         (res as any).insertedCount ??
    //         (res.insertedIds ? Object.keys(res.insertedIds).length : 0);

    //     return { inserted };
    // }

    async findOneSentimentAnalysis(
        filter: FilterQuery<SentimentAnalysis>,

    ): Promise<SentimentAnalysis | null> {
        const doc = await this.sentimentAnalysisModel
            .findOne(filter)


        return doc;
    }

    // async findManyRawData(filter: FilterQuery<RawData>): Promise<RawData[]> {
    //     const docs = await this.rawModel.find(filter);
    //     return docs
    // }

    // async updateOneRawData(filter: FilterQuery<RawData>, doc: NewRawData): Promise<RawData | null> {
    //     const updated = await this.rawModel.findOneAndUpdate(filter, doc, { new: true });
    //     return updated
    // }

    // async deleteOneRawData(filter: FilterQuery<RawData>): Promise<RawData | null> {
    //     const deleted = await this.rawModel.findOneAndDelete(filter);
    //     return deleted;
    // }
}
