import { createProxyMiddleware } from 'http-proxy-middleware';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './src/app.module';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS if needed
  app.enableCors();

  await app.init();
}

bootstrap();
export default server;
