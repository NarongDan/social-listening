import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';            // runtime import (คงไว้)
import brightdataConfig from './brightdata.config';
import type { ConfigType } from '@nestjs/config';       // 👈 เปลี่ยนเป็น import type
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
            const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&notify=false&include_errors=true`;
            const body = { input: Array.isArray(input) ? input : [input] };

            console.log('body------------', body)
            const { data } = await firstValueFrom(this.http.post(url, body, { headers: this.headers }));

            console.log('data-------------', data)
            // ปกติ data.id คือ run/dataset id ที่ใช้ตามไป export ได้
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



}