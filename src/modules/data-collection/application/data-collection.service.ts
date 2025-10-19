// src/modules/data-collection/application/data-collection.service.ts
import { Injectable } from '@nestjs/common';
import { FacebookService } from '../providers/facebook/facebook.service';
import { StorageService } from '../../storage/storage.service';


@Injectable()
export class DataCollectionService {
    constructor(private readonly fb: FacebookService, private readonly storage: StorageService) { }

    async collectFbPagesPostsByProfileUrlSync(payload: any, batchKey?: string) {
        // const key = batchKey ?? new Date().toISOString();
        // const docs = await this.fb.pagesPostsByProfileUrlSync(payload, key);
        // return this.storage.saveManyRawData(docs);
    }

    async collectFbPagesPostsByProfileUrlAsync(payload: any, batchKey?: string) {
        const key = batchKey ?? new Date().toISOString();
        const docs = await this.fb.pagesPostsByProfileUrlAsync(payload, key, { intervalMs: 4000, maxAttempts: 30 });
        return this.storage.saveManyRawData(docs);
    }

    async downloadFacebookSnapshot(snapshot_id: string, batchKey?: string) {
        const key = batchKey ?? new Date().toISOString();
        const docs = await this.fb.downloadFacebookSnapshot(snapshot_id, key);

        return this.storage.saveManyRawData(docs);
    }
}
