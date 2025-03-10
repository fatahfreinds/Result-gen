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

  // const CorsOptions = {
  //   "origin": "http://localhost:3000",
  // "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  // "preflightContinue": false,
  // "optionsSuccessStatus": 204
  //   "credentials": "true"
  // }

 app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
  
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
