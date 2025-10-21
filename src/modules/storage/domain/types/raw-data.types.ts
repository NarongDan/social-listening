
export type RawDataSource = 'facebook' | 'brightdata' | string;

/** โครงสร้างโดเมนของ RawData (ไม่ผูกกับ Mongoose) */
export interface RawData {
    /** id ภายในระบบ (string เพื่อไม่ผูกกับ ObjectId) */
    id?: string;

    /** แหล่งที่มา เช่น 'facebook', 'brightdata' */
    source: RawDataSource;

    snapshot_id: string

    scraper?: string

    datasetId?: string

    /** คีย์รอบการเก็บ เช่น jobId/snapshotId/วันที่ */
    batchKey?: string;

    /** ตัวระบุภายนอก (post_id / url ฯลฯ) */
    externalId?: string;

    /** ข้อมูลดิบทั้งหมด */
    payload: unknown;

    /** เวลาที่เก็บมาจริง (ถ้ามี) */
    collectedAt?: Date;

    /** เมตาเพิ่ม เช่น endpoint, request_id, http_status ฯลฯ */
    meta?: Record<string, any>;

    /** คีย์กันซ้ำ (เช่น sha256 ของ (source,batchKey,externalId)) */
    dedupeKey?: string;

    /** ออดิท */
    createdBy?: string;
    updatedBy?: string;


    /** timestamps จาก @Schema({ timestamps: true }) */
    createdAt?: Date;
    updatedAt?: Date;
}

/** ใช้ตอนสร้างเรคอร์ดใหม่ */
export type NewRawData = Omit<RawData, 'id' | 'createdAt' | 'updatedAt'>;

/** ตัวกรองทั่วไปเวลาค้นหา */
export interface RawDataQuery {
    source?: RawDataSource;
    batchKey?: string;
    externalId?: string;
    from?: Date; // ช่วงเวลา (collectedAt/createdAt)
    to?: Date;
    limit?: number;
    skip?: number;
}
