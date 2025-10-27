import { NestFactory } from '@nestjs/core';
import { ProcessingModule } from './modules/processing/processing.module';
import { Logger } from '@nestjs/common';

// จุดสำคัญ: ใช้ ApplicationContext, ไม่ใช่ NestApplication (ไม่มี HTTP server)
async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(
        ProcessingModule,
        {
            logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        },
    );

    const logger = new Logger('ProcessingWorker');
    logger.log('🚀 Processing worker started and listening to queue "processing"');

    // อย่าปิด appContext นะ ต้องเปิดทิ้งไว้เพื่อให้ worker loop ยังรัน
}
bootstrap();
