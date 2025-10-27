import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'sentiment_analysis' })
export class SentimentAnalysis extends Document {
    @Prop({ required: true, index: true })
    processedId: string; // FK ไปที่ processed_data._id

    @Prop({ required: true })
    sentiment: 'positive' | 'neutral' | 'negative';

    @Prop({ required: true })
    stance: string; // สนับสนุน | คัดค้าน | เสียดสี | ไม่มีท่าที

    @Prop({ required: true })
    confidence: number; // 0-1

    @Prop({ required: true })
    reason: string;

    // @Prop({ required: true })
    // model: string; // เช่น gpt-5-mini หรืออะไรก็ตามใน config

    @Prop()
    modelUsed?: string;

    @Prop({ required: true })
    scraper: string; // ต้นทางข้อมูล เช่น FB_COMMENTS_BY_URL

    @Prop()
    language?: string;

    @Prop()
    contentType?: string; // 'comment' | 'post' | ...

    @Prop({ type: MongooseSchema.Types.Mixed, required: false })
    meta?: any;

}

export const SentimentAnalysisSchema = SchemaFactory.createForClass(SentimentAnalysis);

// ช่วยกันวิเคราะห์ซ้ำ record เดิมซ้ำๆ
SentimentAnalysisSchema.index({ processedId: 1 }, { unique: true });
