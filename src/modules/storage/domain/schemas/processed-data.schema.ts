import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'processed_data' })
export class ProcessedData extends Document {

    declare _id: Types.ObjectId;

    @Prop({ required: true })
    rawDataId: string;

    @Prop({ required: true })
    source: string

    @Prop({ required: true, index: true })
    scraper: string; // <--- เพิ่ม

    @Prop()
    headline?: string;

    @Prop({ required: true })
    text: string;

    @Prop({ default: 'th' })
    language?: string;

    @Prop({ enum: ['comment', 'post', 'reply'], default: 'post' })
    contentType: string;

    @Prop()
    externalId?: string; // เช่น post_id หรือ url

    @Prop()
    batchKey?: string;   // ใช้ group job, snapshot รอบเก็บข้อมูล

    @Prop({ type: MongooseSchema.Types.Mixed, required: false })
    meta?: any;



    @Prop({ default: false })
    isDuplicate: boolean;

    @Prop({ default: false })
    autoAnalyze?: boolean; // if true, send to analysis queue

}

export const ProcessedDataSchema = SchemaFactory.createForClass(ProcessedData);
