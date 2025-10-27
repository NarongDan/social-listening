import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AnalysisService } from '../../application/analysis.service';

type AnalysisJobData = {
    processedId: string;
    task: 'sentiment';
};

@Processor('analysis', { concurrency: 5 })
@Injectable()
export class AnalysisConsumer extends WorkerHost {
    private readonly logger = new Logger(AnalysisConsumer.name);

    constructor(
        private readonly analysisService: AnalysisService,
    ) {
        super();
    }

    async process(job: Job<AnalysisJobData>): Promise<any> {
        const { processedId, task } = job.data;
        const started = Date.now();

        switch (task) {
            case 'sentiment': {
                const sentimentDoc = await this.analysisService.runSentiment(processedId);

                const ms = Date.now() - started;
                this.logger.log(
                    `✅ Sentiment done processedId=${processedId} sentiment=${sentimentDoc.sentiment} (${ms}ms)`,
                );

                return {
                    task,
                    processedId,
                    sentiment: sentimentDoc.sentiment,
                    confidence: sentimentDoc.confidence,
                    durationMs: ms,
                };
            }

            default:
                throw new Error(`Unsupported analysis task: ${task}`);
        }
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, err: Error) {
        this.logger.error(
            `❌ analysis job failed id=${job.id} task=${job.data?.task} processedId=${job.data?.processedId}: ${err.message}`,
        );
    }
}
