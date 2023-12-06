import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

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
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @UseAuth()
  @Post()
  async updateUser(@Req() request: AuthRequest, @Body() body: UpdateUserDTO) {
    const user = await this.usersService.update(request.user.id, body);

    delete user.password;
    delete user.role;

    return user;
  }

  @UseAuth()
  @Get('has-lost-devices')
  userHasLostDevices(@Req() request: AuthRequest) {
    return this.usersService.userHasLostDevices(request.user.id);
  }
}
