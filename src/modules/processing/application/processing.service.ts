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
 * entrypoint หลัก: เลือก handler ตาม scraper
 */
export function buildProcessedFromRaw(raw: RawData): ProcessedData {
    const scraper = raw.scraper ?? raw.meta?.scraper;

    switch (scraper) {
        case 'FB_COMMENTS_BY_URL':
            return buildProcessedScraperFbComments(raw);

        case 'FB_PAGES_POSTS_BY_PROFILE_URL':
            // TODO: รองรับโพสต์ของเพจ (trend use case)
            throw new Error('Scraper FB_PAGES_POSTS_BY_PROFILE_URL not implemented yet');

        default:
            throw new Error(`Unsupported scraper: ${scraper ?? '(undefined)'}`);
    }

}

/**
 * แปลง raw record ที่มาจาก BrightData scraper: FB_COMMENTS_BY_URL
 * ให้กลายเป็น ProcessedData พร้อมใช้งานต่อใน sentiment pipeline
 */
function buildProcessedScraperFbComments(raw: RawData): ProcessedData {
    const p = raw.payload ?? {};

    // 1. เนื้อคอมเมนต์ที่จะเอาไปวิเคราะห์ sentiment
    const text = sanitizeText(p.comment_text ?? '');

    // 2. headline = บริบทของโพสต์ต้นทาง
    //    ยังไม่มีข้อความโพสต์จริงในตัวอย่าง payload ที่ให้มา
    //    ใช้ post_url เป็น proxy ชั่วคราว
    //    ถ้ามี field ที่เป็น caption/โพสต์จริงในอนาคต ให้สลับมาใช้ทันที
    const headline =
        p.post_headline ??
        p.post_message ??
        p.post_text ??
        p.post_caption ??
        p.post_url ??
        p.url ??
        undefined;

    // 3. externalId ใช้ post_id หรือ comment_id (ขึ้นกับมุมมอง)
    //    - ถ้าจะวัด sentiment ต่อโพสต์ ใช้ post_id
    //    - ถ้าอยาก track per-comment โดยตรง ใช้ comment_id
    //    ตอนนี้เราจะใส่ทั้งสองไว้ใน meta ด้วย
    const externalId = p.comment_id ?? p.post_id ?? raw.externalId;

    // 4. contentType
    const contentType: 'comment' | 'reply' | 'post' =
        p.reply === true ? 'reply' : 'comment';

    // 5. language
    //    ถ้ายังไม่มี language detection จริง ให้ undefined แล้ว schema จะ default 'th'
    //    ถ้า BrightData เริ่มส่งภาษามา (p.lang / p.language) ก็ใช้ทันที
    const languageGuess = p.lang ?? p.language ?? raw.meta?.language ?? undefined;

    // 6. duplicate flag (เบื้องต้น = false)
    //    คุณสามารถเติม logic dedupe ภายหลัง เช่นเทียบ hash (source + comment_id + text)
    const isDuplicate = false;

    // 7. meta เก็บ context เสริมที่ sentiment ยังไม่ใช้ แต่ trend อนาคตจะใช้
    const meta: Record<string, any> = {
        post_id: p.post_id,
        comment_id: p.comment_id,
        user_id: p.user_id,
        user_name: p.user_name,
        post_url: p.post_url,
        comment_link: p.comment_link,
        num_likes: p.num_likes,
        num_replies: p.num_replies,
        reply: p.reply,
        parent_comment_id: p.parent_comment_id,
        date_created: p.date_created,
        timestamp: p.timestamp,
        batchKey: raw.batchKey,
        snapshot_id: raw.snapshot_id,
        datasetId: raw.datasetId ?? raw.meta?.datasetId,
        scraper: raw.scraper ?? raw.meta?.scraper,
        collectedAt: raw.collectedAt ?? p.collectedAt,
    };

    // 8. สร้าง ProcessedData (plain object)
    const processed: ProcessedData = {
        rawDataId: raw._id.toString(),
        source: raw.source,
        scraper: raw.scraper ?? raw.meta?.scraper ?? 'UNKNOWN', // <--- now explicit
        headline,
        text,
        language: languageGuess ?? undefined, // schema มี default 'th'
        contentType,
        externalId,
        batchKey: raw.batchKey ?? raw.snapshot_id ?? undefined,
        meta,
        isDuplicate,

    } as any;

    return processed;
}

function sanitizeText(input: string): string {
    return (input || '')
        .replace(/\s+/g, ' ')
        .trim();
}