import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  await repl(AppModule);
}
bootstrap().catch((err: unknown) => {
  console.error('Failed to start repl:', err);
  process.exit(1);
});
