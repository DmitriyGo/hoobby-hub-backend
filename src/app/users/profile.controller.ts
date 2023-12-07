import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { REFRESH_TOKEN } from '@/constants/auth';

import { UpdateUserDTO } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { UseAuth } from '../../decorators/auth';
import { AuthRequest } from '../auth/auth-request.interface';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @UseAuth()
  @Get()
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  async getProfile(@Req() request: AuthRequest) {
    const user = await this.usersService.findOne({
      id: request.user.id,
      devices: true,
    });

    delete user.password;
    delete user.role;

    return user;
  }

  @UseAuth()
  @Delete()
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @UseAuth()
  @Post()
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  async updateUser(@Req() request: AuthRequest, @Body() body: UpdateUserDTO) {
    const user = await this.usersService.update(request.user.id, body);

    delete user.password;
    delete user.role;

    return user;
  }

  @UseAuth()
  @Get('has-lost-devices')
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  userHasLostDevices(@Req() request: AuthRequest) {
    return this.usersService.userHasLostDevices(request.user.id);
  }
}
