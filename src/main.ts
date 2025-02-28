import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// At the top of your main.ts file
import * as nodeCrypto from 'crypto';

// Only add the specific function needed
if (!global.crypto) {
  (global as any).crypto = {
    randomUUID: nodeCrypto.randomUUID
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
