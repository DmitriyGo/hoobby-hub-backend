import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Welcome')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Welcome message.' })
  welcome() {
    this.logger.log('Accessed the root endpoint');
    return 'Welcome to the HobbyHub!';
  }
}
