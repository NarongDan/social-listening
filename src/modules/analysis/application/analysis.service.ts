import { Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { SentimentService } from '../services/sentiment/sentiment.service';
import { SentimentResult } from '../services/sentiment/sentiment.schema';
import { StorageService } from '../../storage/storage.service';
import { SentimentAnalysis } from '../../storage/domain/schemas/sentiment-analysis.schema';

@Injectable()
export class AnalysisService {
    private readonly logger = new Logger(AnalysisService.name);
    constructor(
        private readonly sentimentService: SentimentService,
        private readonly storage: StorageService,
    ) { }

    async analyzeComment(headline: string, comment: string): Promise<SentimentResult & { usage: { input: number; output: number; total: number } }> {
        return this.sentimentService.analyzeComment(headline, comment);
    }

    async runSentiment(processedId: string): Promise<SentimentAnalysis> {

        try {
            // 1) กันยิงซ้ำ
            const existing = await this.storage.findOneSentimentAnalysis({ processedId });
            if (existing) {
                this.logger.debug(`Sentiment already exists for processedId=${processedId}`);
                return existing;
            }



            // 2) โหลด processed data ต้นทาง
            const processed = await this.storage.findProcessedData({ _id: new Types.ObjectId(processedId) });


            if (!processed) {
                throw new Error(`ProcessedData not found: ${processedId}`);
            }

            // // 3) ส่งไป analyze 
            const result = await this.analyzeComment(
                processed.headline ?? '',
                processed.text ?? '',
            );


            // // 4) เอาผลไปบันทึก

            // normalize output เผื่อ LLM คืนของแปลก
            const sentimentDoc = {
                processedId,
                sentiment: result.sentiment,
                stance: result.stance,
                confidence: result.confidence,
                reason: result.reason,
                // model: result.model ?? 'gpt-5-mini',
                scraper: processed.scraper,
                language: processed.language,
                contentType: processed.contentType,
                meta: {
                    usage: result.usage ?? undefined,
                },
            } as SentimentAnalysis;

            // 5) บันทึก
            const saved = await this.storage.insertOneSentimentAnalysis(sentimentDoc);

            this.logger.log(
                `Sentiment analyzed for processedId=${processedId} sentiment=${saved.sentiment} confidence=${saved.confidence}`,
            );

            return saved;

        } catch (error) {
            console.log('error---------', error)
            throw error
        }

    }
}
