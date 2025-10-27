import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ProcessingService } from '../../application/processing.service';


type ProcessingJobData = { rawId: string };

@Processor('processing', { concurrency: 10 })
@Injectable()
// export class ProcessingConsumer extends WorkerHost {
export class ProcessingConsumer extends WorkerHost {
    private readonly logger = new Logger(ProcessingConsumer.name);

    constructor(private readonly processingService: ProcessingService) {
        super();
    }
    /**
     * BullMQ จะเรียกอัตโนมัติเมื่อมี job ใหม่ในคิว 'processing'
     */
    async process(job: Job<ProcessingJobData>): Promise<any> {
        const { rawId } = job.data;

        const started = Date.now();

        // 1) เช็กว่ามี processed ไปแล้วไหม
        const already = await this.processingService.isAlreadyProcessed(rawId);
        if (already) {
            this.logger.debug(`Skip rawId=${rawId} (already processed as ${already._id})`);
            return { skipped: true, processedId: already._id };
        }

        // 2) ประมวลผลจริง
        const { processed, autoAnalyze } =
            await this.processingService.processRawId(rawId);

        // 3) ถ้ามีการตั้งให้ auto-analyze
        await this.processingService.maybeEnqueueAnalysis(processed, autoAnalyze);

        const durationMs = Date.now() - started;
        this.logger.log(`✅ Processed rawId=${rawId} → processedId=${processed._id} (${durationMs}ms)`);

        return {
            skipped: false,
            processedId: processed._id,
            durationMs,
            autoAnalyze,
        };
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, err: Error) {
        this.logger.error(`❌ processing job failed id=${job.id} rawId=${job.data?.rawId}: ${err.message}`);
    }
}
