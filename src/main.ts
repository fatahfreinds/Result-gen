import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const cookieParser = require('cookie-parser')

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // adding global validation pipe
  app.useGlobalPipes(new ValidationPipe({transform :  true}))

  // adding configuration
  const configService : ConfigService = app.get(ConfigService)

  // setting cookie parser
  app.use(cookieParser());

  // cors origin
  app.enableCors({ 
    origin: "*" ,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
