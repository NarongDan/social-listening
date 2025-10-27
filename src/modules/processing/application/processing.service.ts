import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../../storage/storage.service';
import { ProcessedData } from '../../storage/domain/schemas/processed-data.schema';
import { RawData } from '../../storage/domain/schemas/raw-data.schema';
import { AnalysisProducer } from '../adapters/queues/analysis.producer';
import { Types } from 'mongoose';


@Injectable()
export class ProcessingService {
    private readonly logger = new Logger(ProcessingService.name);

    constructor(
        private readonly storage: StorageService,
        private readonly analysisProducer: AnalysisProducer,
    ) { }

    /**
     * ป้องกันประมวลผลซ้ำ
     */
    async isAlreadyProcessed(rawId: string): Promise<ProcessedData | null> {
        return this.storage.findProcessedData({ rawDataId: rawId });
    }

    /**
     * pipeline หลัก:
     * - ดึง raw ตาม rawId
     * - แตก payload → สร้าง processed object
     * - บันทึกลง processed_data
     * - คืน processed + flag autoAnalyze (ตอนนี้ยังไม่มี autoAnalyze ใน schema RawData, default=false)
     */

    async processRawId(rawId: string): Promise<{
        processed: ProcessedData;
        autoAnalyze: boolean;
    }> {
        // 1) อ่าน raw
        const rawDoc = await this.storage.findRawData({ _id: new Types.ObjectId(rawId) });
        if (!rawDoc) {
            throw new Error(`RawData not found: ${rawId}`);
        }

        // 2) สร้างข้อมูล normalized สำหรับ processed_data
        const normalized = buildProcessedFromRaw(rawDoc);

        // 3) เขียนลง processed_data
        const savedProcessed = await this.storage.insertProcessedData(normalized);

        this.logger.debug(
            `Processed rawId=${rawId} -> processedId=${savedProcessed._id} (isDuplicate=${savedProcessed.isDuplicate})`,
        );

        // TODO: ถ้าวันหนึ่งคุณอยากตัดสินใจจาก rawDoc.meta.autoAnalyze ให้ดึงตรงนี้
        const autoAnalyze = false;

        return {
            processed: savedProcessed,
            autoAnalyze,
        };
    }


    async maybeEnqueueAnalysis(processed: ProcessedData, autoAnalyze: boolean) {
        if (!autoAnalyze) return;
        await this.analysisProducer.enqueueSentiment(processed._id.toString());
    }
}

/**
 * สร้าง ProcessedData (plain object) จาก RawData
 * จุดนี้คือ mapping rule สำคัญ
 */
function buildProcessedFromRaw(raw: RawData): ProcessedData {
    // 1) ดึงค่าที่สนใจจาก raw.payload
    const {
        text,
        headline,
        contentType,
        externalId,
        languageGuess,
    } = extractNormalizedFieldsFromRaw(raw);

    // 2) บีบ whitespace ให้สะอาด
    const cleanedText = cleanText(text);

    // 3) ทำ dedupe key แบบง่าย (optional)
    const dedupeKey = calcSoftDedupeKey(raw.source, externalId, cleanedText);

    // ถ้าอยาก mark duplicate:
    // สมมติเรายังไม่มี lookup processed_data ตาม dedupeKey
    // ตอนนี้เราจะตั้ง isDuplicate=false ไว้ก่อน
    // ในอนาคตคุณสามารถเช็ค storage.findProcessedData({ 'meta.dedupeKey': dedupeKey })
    // แล้ว flip isDuplicate=true ได้
    const isDuplicate = false;

    const processedObj: ProcessedData = {
        // binding กลับไปหา raw record นี้
        rawDataId: raw._id.toString(),

        source: raw.source,

        // บริบท/หัวข้อของข้อความ (เช่นหัวข้อโพสต์)
        headline,

        // เนื้อความที่พร้อมใช้วิเคราะห์ sentiment / stance
        text: cleanedText,

        // ภาษาที่คาดเดา ณ ตอนนี้ (fallback 'th')
        language: languageGuess ?? 'th',

        // ประเภทของ content เช่น comment/post/reply
        contentType: contentType ?? 'post',

        // ตัวชี้โพสต์/คอมเมนต์ เช่น post_id, url
        externalId: externalId ?? raw.externalId,

        // ชุดรัน/รอบการดึง
        batchKey: raw.batchKey ?? raw.snapshot_id ?? undefined,

        // meta เก็บข้อมูลอ้างอิงกลับไปยัง raw
        meta: {
            snapshot_id: raw.snapshot_id,
            datasetId: raw.datasetId,
            scraper: raw.scraper,
            dedupeKey,
            collectedAt: raw.collectedAt,
            metaFromRaw: raw.meta ?? undefined,
        },

        isDuplicate,
    } as any;

    return processedObj;
}

/**
 * ดึงฟิลด์สำคัญจาก raw.payload
 * NOTE: ตรงนี้คือจุดเดียวที่คุณต้องอัพเดตถ้า BrightData เปลี่ยน shape
 */
function extractNormalizedFieldsFromRaw(raw: RawData): {
    text: string;
    headline?: string;
    contentType?: 'comment' | 'post' | 'reply';
    externalId?: string;
    languageGuess?: string;
} {
    const p = raw.payload ?? {};

    // ตัวอย่าง heuristic:
    // - ถ้าเป็นคอมเมนต์ BrightData มักเก็บ message/comment/message_text
    // - ถ้าเป็นโพสต์ อาจเก็บ message/headline/title
    // - externalId อาจมาจาก post_id หรือ comment_id
    // ปรับตรงนี้ให้ match โครงสร้างจริงของ payload ของคุณ

    const text =
        p.comment_text ??
        p.comment ??
        p.message ??
        p.text ??
        '';

    const headline =
        p.headline ??
        p.post_headline ??
        p.post_title ??
        p.parent_post_headline ??
        raw.meta?.headline ??
        undefined;

    const externalId =
        p.comment_id ??
        p.post_id ??
        p.url ??
        raw.externalId ??
        undefined;

    // content type: เดาว่า ถ้ามี comment_id -> comment
    // ถ้ามี post_id -> post
    let contentType: 'comment' | 'post' | 'reply' | undefined;
    if (p.comment_id) contentType = 'comment';
    else if (p.post_id) contentType = 'post';
    else contentType = undefined;

    // เดายังไงก็ได้ตอนนี้ สำหรับ language
    // (ถ้า BrightData มี field ภาษา ใช้อันนั้น)
    const languageGuess =
        p.lang ??
        p.language ??
        raw.meta?.language ??
        undefined;

    return {
        text,
        headline,
        contentType,
        externalId,
        languageGuess,
    };
}

/**
 * ล้าง whitespace ให้พร้อมส่งเข้า model
 */
function cleanText(input: string): string {
    return (input || '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * dedupeKey แบบ soft (ไม่ต้อง unique ใน DB ตอนนี้)
 * ใช้ช่วยบอกว่า content นี้น่าจะเหมือนเดิมไหม
 */
function calcSoftDedupeKey(
    source: string,
    externalId: string | undefined,
    text: string,
): string | undefined {
    const base = [
        source ?? '',
        externalId ?? '',
        text,
    ]
        .join('||')
        .toLowerCase()
        .trim();

    if (!base || base === '||') return undefined;

    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        hash = (Math.imul(31, hash) + base.charCodeAt(i)) | 0;
    }
    return 'h' + hash.toString(16);
}
