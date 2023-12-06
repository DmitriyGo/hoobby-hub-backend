import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { APPROVE_CHECK } from '@/constants/devices';
import { Device } from '@/models/device.model';

import { DevicesService } from './devices.service';
import { CreateDeviceDTO } from './dtos/create-device.dto';
import { AdminAuth } from '../../decorators/auth';
import { UsersService } from '../users/users.service';

@ApiTags('DevicesAdmin')
@Controller('devices-admin')
export class DevicesAdminController {
  constructor(
    private readonly deviceService: DevicesService,
    private readonly userService: UsersService,
  ) {}

  @AdminAuth()
  @Post()
  async addDevice(
    @Query('userId') userId: string,
    @Body() createDeviceDTO: CreateDeviceDTO,
  ) {
    if (Number.isNaN(+userId)) {
      return new Error('Id is not a number');
    }

    const entityWithId = await this.deviceService.findOne({
      id: createDeviceDTO.id,
      user: { id: parseInt(userId) },
    });

    if (!!entityWithId) {
      throw new ForbiddenException();
    }

    setTimeout(async () => {
      const entityForApprove = await this.deviceService.findOne({
        id: createDeviceDTO.id,
        user: { id: parseInt(userId) },
      });

      if (!entityForApprove.approved) {
        await this.deviceService.remove({
          id: entityForApprove.id,
          user: { id: parseInt(userId) },
        });
      }
    }, APPROVE_CHECK);

    const user = await this.userService.findOne({ id: parseInt(userId) });

    return this.deviceService.create(user, {
      id: createDeviceDTO.id,
      user: { id: parseInt(userId) },
    });
  }

  @AdminAuth()
  @Get()
  getAll() {
    return this.deviceService.find({});
  }

  @AdminAuth()
  @Get('/for-user')
  getAllForUser(@Query('userId') userId: string) {
    if (Number.isNaN(+userId)) {
      return new Error('Id is not a number');
    }

    return this.deviceService.find({ user: { id: parseInt(userId) } });
  }

  @AdminAuth()
  @Get('/:id')
  getById(@Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    return this.deviceService.find({
      id: parseInt(id),
    });
  }

  @AdminAuth()
  @Delete('/:id')
  removeDevice(@Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    return this.deviceService.remove({
      id: parseInt(id),
    });
  }

  @AdminAuth()
  @Post('/:id')
  updateDevice(
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() body: Partial<Device>,
  ) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    console.log(userId, id, body);

    return this.deviceService.update(
      {
        id: parseInt(id),
        user: { id: parseInt(userId) },
      },
      body,
    );
  }
}
