
import { Body, Controller, Post, Query } from '@nestjs/common';

import { FbPagesPostsPayloadDto } from './dtos/fb-pages.dto';
import { DataCollectionService } from '../application/data-collection.service';


@Controller('dev/data-collection')
export class DevDataCollectionController {
    constructor(private readonly dataCollectionService: DataCollectionService) { }

    /** Synchronous: รอผลแล้วบันทึกลง Storage */
    @Post('facebook/pages-posts/sync')
    async fbPagesPostsSync(@Body() dto: FbPagesPostsPayloadDto): Promise<{ inserted: number }> {
        // const res = await this.dataCollectionService.collectFbPagesPostsByProfileUrlSync(dto.input, dto.batchKey);
        // return res; // { inserted: number }
        return { inserted: 0 };
    }

    /** Asynchronous: trigger + poll แล้วบันทึกลง Storage */
    @Post('facebook/pages-posts/async')
    async fbPagesPostsAsync(
        @Body() dto: FbPagesPostsPayloadDto,
    ): Promise<{ inserted: number }> {
        // ถ้าคุณแยก start/fetch ก็เปลี่ยนมาที่ service ฝั่งนั้นได้
        const res = await this.dataCollectionService.collectFbPagesPostsByProfileUrlAsync(dto.input, dto.batchKey);
        return res; // { inserted: number }
    }

    @Post('facebook/download-snapshot')
    async downloadSnapshot(
        @Query('snapshot_id') snapshot_id: string
    ) {
        await this.dataCollectionService.downloadFacebookSnapshot(snapshot_id);
    }
}
