
import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { FbPagesPostsPayloadDto, FbPageInputItemDto, FbCommentsPayloadDto } from './dtos/fb-pages.dto';
import { DataCollectionService } from '../application/data-collection.service';


@Controller('dev/data-collection')
export class DevDataCollectionController {
    constructor(private readonly dataCollectionService: DataCollectionService) { }

    @Get()
    async test() {
        const snapshotId = "s_mgzzymakk6rgufiht"


        await this.dataCollectionService.receiveFacebookSnapshotFromBrightData({}, snapshotId)
    }

    /** Synchronous: รอผลแล้วบันทึกลง Storage */
    @Post('facebook/pages-posts/sync')
    async fbPagesPostsSync(@Body() dto: FbPagesPostsPayloadDto): Promise<{ inserted: number }> {
        // const res = await this.dataCollectionService.collectFbPagesPostsByProfileUrlSync(dto.input, dto.batchKey);
        // return res; // { inserted: number }
        return { inserted: 0 };
    }


    @Post('facebook/pages-posts/async')
    async fbPagesPostsAsync(
        @Body() dto: FbPagesPostsPayloadDto,
    ): Promise<void> {
        // ถ้าคุณแยก start/fetch ก็เปลี่ยนมาที่ service ฝั่งนั้นได้
        const { input, batchKey } = dto
        await this.dataCollectionService.collectFbPagesPostsByProfileUrlAsync(input);

        // return res; // { inserted: number }
    }

    @Post('facebook/comments/async')
    async fbCommentsAsync(
        @Body() dto: FbCommentsPayloadDto,
    ): Promise<void> {
        // ถ้าคุณแยก start/fetch ก็เปลี่ยนมาที่ service ฝั่งนั้นได้
        const { input, batchKey } = dto
        await this.dataCollectionService.collectFbCommentsAsync(input);
        // return res; // { inserted: number }
    }

    @Post('facebook/download-snapshot')
    async downloadSnapshot(
        @Query('snapshot_id') snapshot_id: string
    ) {
        await this.dataCollectionService.downloadFacebookSnapshot(snapshot_id);
    }

    @Post("webhook/facebook/brightdata")
    async receiveFacebookSnapshotFromBrightData(
        @Body() payload: any,
        @Req() req: Request
    ) {

        const snapshotId = req.headers['snapshot-id'];
        console.log('snapshotId', snapshotId)

        await this.dataCollectionService.receiveFacebookSnapshotFromBrightData(payload, snapshotId)
    }
}
