import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module";
import { ProcessingService } from "./application/processing.service";
import { BullModule } from "@nestjs/bullmq";
import { ProcessingConsumer } from "./adapters/queues/processing.consumer";
import { AnalysisProducer } from "./adapters/queues/analysis.producer";
import { BullQueueModule } from "../../shared/queue/bull.config";


@Module({
  providers: [ProcessingService, ProcessingConsumer, AnalysisProducer],
  imports: [BullQueueModule,
    StorageModule,
    BullModule.registerQueue({ name: 'processing' }),
    BullModule.registerQueue({ name: 'analysis' }),],
  exports: [ProcessingService],
})
export class ProcessingModule { }
