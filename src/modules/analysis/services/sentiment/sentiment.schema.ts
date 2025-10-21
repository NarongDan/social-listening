import { z } from 'zod';

export const sentimentSchema = z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    stance: z.enum(['สนับสนุน', 'คัดค้าน', 'เสียดสี', 'ไม่มีท่าที']),
    confidence: z.number().min(0).max(1),
    reason: z.string().min(1),
});

export type SentimentResult = z.infer<typeof sentimentSchema>;
