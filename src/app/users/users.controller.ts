import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { REFRESH_TOKEN } from '@/constants/auth';

import { UpdateUserDTO } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { AdminAuth } from '../../decorators/auth';

@ApiTags('Users')
@Controller('users-admin')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @AdminAuth()
  @Get('/:id')
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  async findUser(@Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('id is not a number');
    }

    const user = await this.usersService.findOne({
      id: parseInt(id),
      devices: true,
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  @AdminAuth()
  @Get()
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  findAllUsers() {
    return this.usersService.find({});
  }

  @AdminAuth()
  @Get('/by-email')
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  findUsersByEmail(@Query('email') email: string) {
    return this.usersService.find({ email });
  }

  @AdminAuth()
  @Delete('/:id')
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @AdminAuth()
  @Post('/:id')
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDTO) {
    return this.usersService.update(parseInt(id), body);
  }
}
