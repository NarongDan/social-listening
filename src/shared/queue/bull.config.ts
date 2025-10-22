import { BullModule } from '@nestjs/bullmq';

export const BullQueueModule = BullModule.forRoot({
    connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: +(process.env.REDIS_PORT ?? 6379),
    },
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 500 },
    },
});
