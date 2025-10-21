import { Injectable } from '@nestjs/common';
import { SentimentService } from '../services/sentiment/sentiment.service';
import { SentimentResult } from '../services/sentiment/sentiment.schema';

@Injectable()
export class AnalysisService {
    constructor(
        private readonly sentimentService: SentimentService
    ) { }

    async analyzeComment(headline: string, comment: string): Promise<SentimentResult & { usage: { input: number; output: number; total: number } }> {
        return this.sentimentService.analyzeComment(headline, comment);
    }
}
