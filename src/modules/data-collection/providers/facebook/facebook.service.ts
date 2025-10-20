// src/modules/data-collection/providers/facebook/facebook.service.ts
import { Injectable } from '@nestjs/common';
import { BrightdataClient } from '../../adapters/brightdata/brightdata.client';
import { NewRawData } from '../../../storage/domain/types/raw-data.types';
import { FbCommentsItemDto, FbPageInputItemDto } from '../../presentation/dtos/fb-pages.dto';

@Injectable()
export class FacebookService {
    constructor(private readonly bd: BrightdataClient) { }

    /** map → NewRawData (รูปแบบเดียวกับที่ใช้ใน Storage) */
    toRaw(row: any, snapshort_id: string, batchKey: string, scraper?: string, datasetId?: string): NewRawData {
        return {
            source: 'facebook',
            snapshot_id: snapshort_id,
            batchKey,
            externalId: row?.post_id ?? row?.id,
            payload: row,
            collectedAt: row?.time ? new Date(row.time) : new Date(),
            ...(scraper && datasetId ? { meta: { scraper, datasetId } } : {}),
        };
    }

    /** ---------- Synchronous mode ---------- */
    // async pagesPostsByProfileUrlSync(payload: any, batchKey: string): Promise<NewRawData[]> {
    //     const ds = this.bd.dataset('FB_PAGES_POSTS_BY_PROFILE_URL');
    //     const rows = await this.bd.scrapeSync(ds, payload);
    //     return rows.map((r: any) => this.toRaw(r, batchKey, 'FB_PAGES_POSTS_BY_PROFILE_URL', ds));
    // }

    /** ---------- Asynchronous mode (trigger + poll) ---------- */
    async pagesPostsByProfileUrlAsync(
        payload: FbPageInputItemDto[],
        // ): Promise<NewRawData[]> {
    ): Promise<{ snapshot_id: string, datasetId: string }> {
        try {
            const ds = this.bd.dataset('FB_PAGES_POSTS_BY_PROFILE_URL');
            const run = await this.bd.triggerAsync(ds, payload);
            const snapshotId = run?.snapshot_id ?? ds;
            await this.bd.deliverSnapshotToWebhook(snapshotId)


            // const { snapshot_id, rows } = await this.bd.pollExport(snapshotId, poll);

            // if (!rows.length || !snapshot_id) return [];

            // return rows.map((r: any) => this.toRaw(r, snapshot_id, batchKey, 'FB_PAGES_POSTS_BY_PROFILE_URL', ds));
            return {
                snapshot_id: snapshotId,
                datasetId: ds
            }
        } catch (e) {
            throw new Error(`FB_PAGES_POSTS_BY_PROFILE_URL async failed: ${(e as Error).message}`);
        }
    }

    async downloadFacebookSnapshot(snapshotId: string, batchKey: string): Promise<NewRawData[]> {
        const { snapshot_id, rows } = await this.bd.downloadSnapshot(snapshotId);
        if (!rows.length) return [];
        const ds = this.bd.dataset('FB_PAGES_POSTS_BY_PROFILE_URL');
        return rows.map((r: any) => this.toRaw(r, snapshot_id, batchKey, 'FB_PAGES_POSTS_BY_PROFILE_URL', ds));
    }

    async commentsAsync(payload: FbCommentsItemDto[]) {
        try {
            const ds = this.bd.dataset('FB_COMMENTS_BY_URL');
            const run = await this.bd.triggerAsync(ds, payload);
            const snapshotId = run?.snapshot_id ?? ds;
            await this.bd.deliverSnapshotToWebhook(snapshotId)
            return {
                snapshot_id: snapshotId,
                datasetId: ds
            }

        } catch (error) {
            throw new Error(`FB_PAGES_POSTS_BY_PROFILE_URL async failed: ${(e as Error).message}`);
        }
    }




}
