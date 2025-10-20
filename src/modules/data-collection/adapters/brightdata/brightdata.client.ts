import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import brightdataConfig from './brightdata.config';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BrightdataClient {
    constructor(
        private readonly http: HttpService,
        @Inject(brightdataConfig.KEY)
        private readonly config: ConfigType<typeof brightdataConfig>,
    ) { }
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

            console.log('datasetId', datasetId)
            console.log('input', input)
            const webhookUrl = 'https://c211a436e62b.ngrok-free.app/dev/data-collection/webhook/facebook/brightdata';

            const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&endpoint=${webhookUrl}&auth_header=&notify=false&format=json&uncompressed_webhook=true&force_deliver=false&include_errors=true`;
            const body = { input: Array.isArray(input) ? input : [input] };


            const { data } = await firstValueFrom(this.http.post(url, body, { headers: this.headers }));

            console.log('data', data)

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
        // if (!/^https?:\/\//i.test(endpoint)) {
        //     throw new Error(`Webhook endpoint must include protocol (http/https): ${endpoint}`);
        // }



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
                        endpoint: 'https://c211a436e62b.ngrok-free.app/dev/data-collection/webhook/facebook/brightdata',
                    },
                    compress: Boolean(opts?.compress),  // ✅ ไม่มีขึ้นบรรทัด
                }
                    , { headers: this.headers }),
            );


            return data; // Bright Data จะตอบรายละเอียด job กลับมา
        } catch (error) {

            throw error;
        }


    }

}