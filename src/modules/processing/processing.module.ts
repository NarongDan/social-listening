import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module";
import { ProcessingService } from "./application/processing.service";
import { BullQueueModule } from "../../shared/queue/bull.config";
import { BullModule } from "@nestjs/bullmq";
import { ProcessingConsumer } from "./adapters/queues/processing.consumer";
import { AnalysisProducer } from "./adapters/queues/analysis.producer";


@Module({
  providers: [ProcessingService, ProcessingConsumer, AnalysisProducer],
  imports: [StorageModule,
    BullQueueModule,
    BullModule.registerQueue({ name: 'processing' }),
    BullModule.registerQueue({ name: 'analysis' }),],
  exports: [ProcessingService],
})
export class ProcessingModule { }
