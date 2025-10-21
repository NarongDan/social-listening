import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import brightdataConfig from './brightdata.config';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BrightdataClient {
    private readonly serverURL: string;
    constructor(
        private readonly http: HttpService,
        @Inject(brightdataConfig.KEY)
        private readonly config: ConfigType<typeof brightdataConfig>,
        private readonly configService: ConfigService,
    ) {
        this.serverURL = this.configService.getOrThrow<string>('SERVER_URL');
    }
    private get headers() {
        return { Authorization: `Bearer ${this.config.token}`, 'Content-Type': 'application/json' };
    }
    /** Generic helper */
    dataset(key: keyof typeof this.config.datasets) {
        return this.config.datasets[key];
    }

    // /** ---------- Synchronous scrape (returns rows immediately) ---------- */
    // async scrapeSync(datasetId: string, input: any): Promise<any[]> {
    //     try {
    //         const url = `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}&notify=false&include_errors=true`;
    //         const body = { input: Array.isArray(input) ? input : [input] };

    //         console.log('body--------------', JSON.stringify(body, null, 2));
    //         const { data } = await firstValueFrom(this.http.post(url, body, { headers: this.headers }));

    //         console.log('data-----------', data)
    //         // API นี้คืน array ของ rows โดยตรง
    //         return data as any[];
    //     } catch (error) {
    //         // throw new Error(`Scrape failed: ${(error as Error).message}`);
    //         throw new Error(`Scrape failed`);
    //     }

    // }

    /** ---------- Asynchronous trigger (returns run info) ---------- */
    async triggerAsync(datasetId: string, input: any): Promise<{ snapshot_id: string; }> {
        try {



            const webhookUrl = `${this.serverURL}/dev/data-collection/webhook/facebook/brightdata'`


            //  เปลี่ยน: body ต้องเป็น "array" ไม่ใช่ { input: [...] }
            const body = Array.isArray(input) ? input : [input];

            // ใช้ params ให้ Axios encode ให้เอง
            const url = 'https://api.brightdata.com/datasets/v3/trigger';

            const { data } = await firstValueFrom(
                this.http.post(url, body, {
                    params: {
                        dataset_id: datasetId,
                        endpoint: webhookUrl,
                        notify: true,                 // ต้อง true เพื่อให้ยิง webhook
                        format: 'json',
                        uncompressed_webhook: true,
                        include_errors: true,
                        // ไม่ต้องใส่ auth_header ถ้าไม่ใช้
                        // auth_header: 'Authorization: Bearer <YOUR_WEBHOOK_SECRET>',
                    },
                    headers: this.headers,
                    timeout: 60000,
                })
            );


            return data;
        } catch (error) {
            throw new Error(`Trigger failed: ${(error as Error).message}`);
        }

    }

    /** ---------- Single export (fetch current results) ---------- */
    async exportOnce(snapshot_id: string): Promise<{ snapshot_id: string, rows: any[] }> {
        try {
            const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshot_id}?format=json`;
            const { data } = await firstValueFrom(this.http.get(url, { headers: this.headers }));

            return { snapshot_id, rows: data };
        } catch (error) {
            throw new Error(`Export failed: ${(error as Error).message}`);
        }

    }


    async downloadSnapshot(snapshot_id: string): Promise<{ snapshot_id: string, rows: any[] }> {
        try {
            const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshot_id}?format=json`;
            const { data } = await firstValueFrom(this.http.get(url, { headers: this.headers }));

            return { snapshot_id, rows: data };
        } catch (error) {
            throw new Error(`Export failed: ${(error as Error).message}`);
        }

    }

    /** ---------- Poll export until rows exist or timeout ---------- */
    async pollExport(
        snapshotId: string,
        opts: { intervalMs?: number; maxAttempts?: number } = {},
    ): Promise<{ snapshot_id: string | null; rows: any[] }> {
        try {
            const intervalMs = opts.intervalMs ?? 4000;
            const maxAttempts = opts.maxAttempts ?? 100;

            for (let i = 0; i < maxAttempts; i++) {
                const { snapshot_id, rows } = await this.exportOnce(snapshotId);
                if (rows.length) return { snapshot_id, rows };
                await new Promise((r) => setTimeout(r, intervalMs));
            }
            return { snapshot_id: null, rows: [] }; // หมดรอบแล้วยังว่าง
        } catch (error) {
            throw new Error(`Poll export failed: ${(error as Error).message}`);
        }
    }


    async deliverSnapshotToWebhook(
        snapshotId: string,
        opts?: {
            template?: string;
            extension?: 'json' | 'jsonl' | 'csv';
            compress?: boolean;
        },
    ): Promise<any> {

        const url = `https://api.brightdata.com/datasets/v3/deliver/${encodeURIComponent(
            snapshotId,
        )}`;

        try {
            const { data } = await firstValueFrom(
                this.http.post(url, {
                    deliver: {
                        type: 'webhook',
                        filename: {
                            template: opts?.template ?? 'fb_pages_{{snapshot_id}}_{{timestamp}}',
                            extension: opts?.extension ?? 'json',
                        },
                        endpoint: `${this.serverURL}/dev/data-collection/webhook/facebook/brightdata`,
                    },
                    compress: Boolean(opts?.compress),
                }
                    , { headers: this.headers }),
            );


            return data; // Bright Data จะตอบรายละเอียด job กลับมา
        } catch (error) {

            throw error;
        }


    }

}