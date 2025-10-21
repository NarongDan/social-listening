import { registerAs } from '@nestjs/config';

export default registerAs('openai', () => ({
    token: process.env.OPENAI_KEY!,
    model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
    temperature: 0.3,
    maxTokens: 1024,
    timeoutMs: 20000,
}));

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type ChatRequest = {
    messages: ChatMessage[];
    model?: string;            // default จาก config
    temperature?: number;      // default จาก config
    maxTokens?: number;        // default จาก config
    timeoutMs?: number;        // default จาก config
    responseFormat?: 'text' | 'json_object'; // default 'text'
};


export type ChatResponse = {
    text: string;
    usage: { input: number; output: number; total: number };
    finishReason?: string;
};