import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcessingProducer {
    constructor(@InjectQueue('processing') private readonly queue: Queue) { }

    async enqueue(rawId: string) {
        return this.queue.add(
            'processing.normalize',
            { rawId },
            {
                jobId: `processing:${rawId}`,
                priority: 2,
                removeOnComplete: 500,
            },
        );
    }
}
