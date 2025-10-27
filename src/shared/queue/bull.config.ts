import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                connection: {
                    host: configService.getOrThrow('REDIS_HOST'),
                    port: configService.getOrThrow<number>('REDIS_PORT'),
                },
                defaultJobOptions: {
                    removeOnComplete: true,
                    removeOnFail: false,
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 500 },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [BullModule],
})
export class BullQueueModule { }
