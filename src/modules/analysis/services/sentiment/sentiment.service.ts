import { Injectable } from '@nestjs/common';
import { OpenAIAdapter } from '../../adapters/llm/openai.adapter';
import { sentimentPrompt } from './sentiment.prompt';
import { sentimentSchema, SentimentResult } from './sentiment.schema';

@Injectable()
export class SentimentService {
    constructor(private readonly openai: OpenAIAdapter) { }

    async analyzeComment(headline: string, comment: string): Promise<SentimentResult & { usage: { input: number; output: number; total: number } }> {
        const prompt = sentimentPrompt(headline, comment);

        const { text, usage } = await this.openai.chatJson({
            messages: [{ role: 'user', content: prompt }],
        });

        try {
            const parsed = JSON.parse(text);
            const result = sentimentSchema.parse(parsed);
            return { ...result, usage };
        } catch (err) {
            throw new Error(`Invalid JSON from model: ${text}`);
        }
    }
}
