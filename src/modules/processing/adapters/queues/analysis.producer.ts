import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * งานวิเคราะห์ที่จะไปฝั่ง analysis worker
 * เช่น sentiment ในตอนนี้
 */
export type AnalysisJobData = {
    processedId: string;
    task: 'sentiment'; // อนาคตเพิ่ม 'trend' | 'topic' | ...
};

@Injectable()
export class AnalysisProducer {
    constructor(
        @InjectQueue('analysis')
        private readonly analysisQueue: Queue<AnalysisJobData>,
    ) { }

    /**
     * enqueue งานวิเคราะห์ sentiment สำหรับ 1 processed record
     * - processedId: อ้างถึง ProcessedData._id
     * - ใช้ jobId แบบ deterministic เพื่อให้ไม่ส่งงานซ้ำ
     */
    async enqueueSentiment(processedId: string) {
        return this.analysisQueue.add(
            'analysis.sentiment', // job name (worker จะ filter จากชื่อนี้ก็ได้)
            {
                processedId,
                task: 'sentiment',
            },
            {
                jobId: `sentiment:${processedId}`, // กัน duplicate
                priority: 2,
                removeOnComplete: 1000,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 500,
                },
            },
        );
    }

    /**
     * generic method ถ้าคุณอยาก control เองว่า task คืออะไร
     */
    async enqueueTask(data: AnalysisJobData) {
        return this.analysisQueue.add(
            `analysis.${data.task}`,
            data,
            {
                jobId: `${data.task}:${data.processedId}`,
                priority: 2,
                removeOnComplete: 1000,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 500,
                },
            },
        );
    }
}
