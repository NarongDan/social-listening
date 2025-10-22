import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module";
import { ProcessingService } from "./application/processing.service";


@Module({
  providers: [ProcessingService],
  imports: [StorageModule],
  exports: [ProcessingService],
})
export class ProcessingModule { }
