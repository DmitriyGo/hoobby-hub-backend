import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DevicesService } from './devices.service';
import { ApproveDeviceDTO } from './dtos/approve-device.dto';
import { CreateDeviceDTO } from './dtos/create-device.dto';
import { DeviceDTO } from './dtos/device.dto';
import { LostDeviceDTO } from './dtos/lost-device.dto';
import { UpdateDeviceDTO } from './dtos/update-device.dto';
import { UseAuth } from '../../decorators/auth';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { AuthRequest } from '../auth/auth-request.interface';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @UseAuth()
  @Post()
  @Serialize(DeviceDTO)
  async addDevice(
    @Request() req: AuthRequest,
    @Body() createDeviceDTO: CreateDeviceDTO,
  ) {
    return this.deviceService.addDevice(createDeviceDTO, req.user);
  }

  @UseAuth()
  @Get()
  getAll(@Request() req: AuthRequest) {
    return this.deviceService.find({ user: { id: req.user.id } });
  }

  @UseAuth()
  @Delete('/:id')
  @Serialize(DeviceDTO)
  removeDevice(@Request() req: AuthRequest, @Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    return this.deviceService.remove({
      id: parseInt(id),
      user: { id: req.user.id },
    });
  }

  @UseAuth()
  @Post('/:id')
  @Serialize(DeviceDTO)
  updateDevice(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: UpdateDeviceDTO,
  ) {
    return this.deviceService.update(
      {
        id: parseInt(id),
        user: { id: req.user.id },
      },
      body,
    );
  }

  @UseAuth()
  @Get('/:id')
  async getById(@Request() req: AuthRequest, @Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    const res = await this.deviceService.find({
      id: parseInt(id),
      user: { id: req.user.id },
    });

    res[0].user = null;

    return res[0];
  }

  @Post('/for-device/approve')
  async approveDevice(@Body() approveDeviceDTO: ApproveDeviceDTO) {
    return this.deviceService.approveDevice(approveDeviceDTO);
  }

  @Get('/for-device/:id')
  getDataForDevice(@Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    return this.deviceService.getDataForDevice(parseInt(id));
  }

  @Post('/for-device/:id')
  setTurnOff(@Param('id') id: string) {
    if (Number.isNaN(+id)) {
      return new Error('Id is not a number');
    }

    return this.deviceService.turnOffDevice(parseInt(id));
  }

  @Post('/device-lost/:id')
  setDeviceIsLost(@Body() lostDTO: LostDeviceDTO) {
    return this.deviceService.lostDevice(lostDTO);
  }
}
