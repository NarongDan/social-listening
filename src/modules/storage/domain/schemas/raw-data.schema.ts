import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'raw_data' })
export class RawData extends Document {

    /** แหล่งที่มา เช่น 'facebook', 'brightdata' */
    @Prop({ required: true, index: true })
    source: string;

    /** คีย์ชุดข้อมูล/รอบการเก็บ เช่น jobId, snapshotId, วันที่เก็บ */
    @Prop({ required: true, index: true })
    batchKey: string;

    @Prop({ required: true, index: true })
    snapshot_id: string

    /** ตัวระบุภายนอก (เช่น post_id / url) เพื่อช่วย de-duplicate แบบนุ่มนวล */
    @Prop({ required: false, index: true })
    externalId?: string;

    /** เนื้อข้อมูลดิบทั้งหมด (อาจใหญ่) */
    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    payload: any;

    /** เวลาที่ข้อมูลถูกเก็บมาจริง (ถ้า BrightData ใส่มา) */
    @Prop({ required: false, index: true })
    collectedAt?: Date;

    /** ข้อมูลเมตาเพิ่ม (เช่น endpoint, request_id, download_url, http_status ฯลฯ) */
    @Prop({ type: MongooseSchema.Types.Mixed, required: false })
    meta?: any;

    /** ฟิลด์ช่วยกันซ้ำแบบเด็ดขาด (hash ของ payload หรือคู่ (source,batchKey,externalId)) */
    @Prop({ required: false, unique: true, sparse: true })
    dedupeKey?: string;

    /** การจัดการออดิทพื้นฐาน */
    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    createdBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    updatedBy?: Types.ObjectId;

    @Prop({ default: false, index: true })
    isDeleted: boolean;
}


export const RawDataSchema = SchemaFactory.createForClass(RawData);

/** ---------- Indexes ---------- */

// คิวรีหลักตามแหล่งที่มา + รอบการเก็บ + เวลา
RawDataSchema.index({ source: 1, batchKey: 1, collectedAt: -1 });

// ใช้ดูรายการล่าสุดโดยไม่ระบุ batch
RawDataSchema.index({ source: 1, createdAt: -1 });

// เร่งการค้นหาตาม externalId (เช่น post_id/url)
RawDataSchema.index({ source: 1, externalId: 1 });


// ช่วย soft-delete
RawDataSchema.index({ isDeleted: 1, source: 1, createdAt: -1 });

// // กรณีคุณสร้างค่า dedupeKey (เช่น SHA256(payload) หรือ `${source}:${externalId}:${batchKey}`)
// // ให้แน่ใจว่าเปิด sparse เพื่อไม่บังคับทุกเรคอร์ดต้องมีค่า
// RawDataSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

