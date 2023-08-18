import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    
    return {
      message : "Server Successfully started"
    };
  }
}
