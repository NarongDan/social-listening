import { Inject, Injectable } from "@nestjs/common";
import openaiConfig, { ChatRequest, ChatResponse } from "./openai.config";
import type { ConfigType } from '@nestjs/config';
import OpenAI from "openai";


@Injectable()
export class OpenAIAdapter {
    private client: OpenAI;
    constructor(
        @Inject(openaiConfig.KEY)
        private readonly config: ConfigType<typeof openaiConfig>
    ) {

        this.client = new OpenAI({
            apiKey: this.config.token,
            timeout: this.config.timeoutMs,  // <— optional default
        });

    }

    async chat(req: ChatRequest): Promise<ChatResponse> {
        const res = await this.client.chat.completions.create(
            {
                model: req.model ?? this.config.model,
                temperature: req.temperature ?? this.config.temperature,
                max_completion_tokens: req.maxTokens ?? this.config.maxTokens,
                messages: req.messages,
                ...(req.responseFormat
                    ? { response_format: { type: req.responseFormat } as any }
                    : {}),
            },
            {
                // timeout ต้องอยู่ที่ "options" (อาร์กิวเมนต์ตัวที่สอง)
                timeout: req.timeoutMs ?? this.config.timeoutMs,
            }
        );

        const msg = res.choices[0]?.message?.content ?? '';
        return {
            text: msg,
            usage: {
                input: res.usage?.prompt_tokens ?? 0,
                output: res.usage?.completion_tokens ?? 0,
                total: res.usage?.total_tokens ?? 0,
            },
            finishReason: res.choices[0]?.finish_reason ?? undefined,
        };
    }

    async chatJson(req: Omit<ChatRequest, 'responseFormat'>): Promise<ChatResponse> {
        return this.chat({ ...req, responseFormat: 'json_object' });
    }
}