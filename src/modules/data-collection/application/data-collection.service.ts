// src/modules/data-collection/application/data-collection.service.ts
import { Injectable } from '@nestjs/common';
import { FacebookService } from '../providers/facebook/facebook.service';
import { StorageService } from '../../storage/storage.service';
import { NewRawData } from '../../storage/domain/types/raw-data.types';
import { FbCommentsItemDto, FbPageInputItemDto } from '../presentation/dtos/fb-pages.dto';

import { ProcessingProducer } from '../adapters/queues/processing.producer';


@Injectable()
export class DataCollectionService {
    constructor(
        private readonly fb: FacebookService,
        private readonly storage: StorageService,
        private readonly processingProducer: ProcessingProducer,
    ) { }

    async collectFbPagesPostsByProfileUrlSync(payload: any, batchKey?: string) {
        // const key = batchKey ?? new Date().toISOString();
        // const docs = await this.fb.pagesPostsByProfileUrlSync(payload, key);
        // return this.storage.saveManyRawData(docs);
    }

    async collectFbPagesPostsByProfileUrlAsync(payload: FbPageInputItemDto[]): Promise<void> {
        console.log('payload--------', payload)
        const { snapshot_id, datasetId } = await this.fb.pagesPostsByProfileUrlAsync(payload);
        const data: NewRawData = {
            source: 'facebook',
            snapshot_id,
            payload: "",
            meta: { scraper: 'FB_PAGES_POSTS_BY_PROFILE_URL', datasetId: datasetId },
            scraper: 'FB_PAGES_POSTS_BY_PROFILE_URL',
            datasetId
        }


        await this.storage.saveRawData(data)
        // return this.storage.saveManyRawData(docs);
    }
    async collectFbCommentsAsync(payload: FbCommentsItemDto[]): Promise<void> {
        const { snapshot_id, datasetId } = await this.fb.commentsAsync(payload);
        const data: NewRawData = {
            source: 'facebook',
            snapshot_id,
            payload: "",
            meta: { scraper: 'FB_COMMENTS_BY_URL', datasetId: datasetId },
            scraper: 'FB_COMMENTS_BY_URL',
            datasetId
        }

        await this.storage.saveRawData(data)
    }

    async downloadFacebookSnapshot(snapshot_id: string, batchKey?: string) {
        const key = batchKey ?? new Date().toISOString();
        const docs = await this.fb.downloadFacebookSnapshot(snapshot_id, key);

        return this.storage.saveManyRawData(docs);
    }

    async receiveFacebookSnapshotFromBrightData(payload: any, snapshotId: string, batchKey?: string): Promise<void> {

        const rawData = await this.storage.findRawData({ snapshot_id: snapshotId, source: 'facebook' })
        // console.log('payload', payload)

        // console.log('rawData', rawData)
        if (!rawData) {
            return
        }

        const key = batchKey ?? new Date().toISOString();

        const rawDataToUpdate = payload.map((r: any) => this.fb.toRaw(r, snapshotId, key, rawData.meta.scraper, rawData.meta.datasetId));

        if (!rawDataToUpdate.length) {
            return
        }
        // await this.storage.updateRawData({ _id: rawData._id }, (rawDataToUpdate))
        await this.storage.saveManyRawData(rawDataToUpdate);
        await this.storage.deleteOneRawData({ _id: rawData._id })



        const rawDatas = await this.storage.findManyRawData({ snapshot_id: snapshotId, source: 'facebook' });

        if (!rawDatas.length) {
            return
        }
        for (const rawData of rawDatas) {
            // ส่งต่อเข้า processing queue
            const rawId = rawData._id!.toString()
            await this.processingProducer.enqueue(rawId);
        }




    }


}