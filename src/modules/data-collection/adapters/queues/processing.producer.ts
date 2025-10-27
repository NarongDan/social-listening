import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcessingProducer {
    constructor(@InjectQueue('processing') private readonly queue: Queue) {


    }

    async enqueue(rawId: string) {
        // console.log('Queue status:', this.queue.opts.connection);
        // console.log('Redis status:', this.queue['connection']?.status);
        try {
            console.log('rawId------in enqueue', rawId)
            const result = await this.queue.add(
                'processing.normalize',
                { rawId },
                {
                    jobId: `processing_${rawId}`,
                    priority: 2,
                    removeOnComplete: 500,
                },
            );


            return result
        } catch (error) {
            console.log('error-----------', error)
        }

    }
}
