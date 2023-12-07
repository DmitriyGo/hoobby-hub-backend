import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Add a new device' })
  @ApiResponse({
    status: 201,
    description: 'The device has been successfully added.',
    type: DeviceDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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

  @UseAuth()
  @Get('/:id/ping')
  async ping(@Request() req: AuthRequest, @Param('id') id: string) {
    if (Number.isNaN(+id)) {
      throw new BadRequestException('Id is not a number');
    }

    return `Connection with device ${id} is established`;
  }

  @UseAuth()
  @Get('/:id/find')
  async alarm(@Request() req: AuthRequest, @Param('id') id: string) {
    if (Number.isNaN(+id)) {
      throw new BadRequestException('Id is not a number');
    }

    const cordinated = this.deviceService.getDeviceLocation(id);

    return `Device ${id} is at ${cordinated}`;
  }

  @UseAuth()
  @Get('/:id/sound-alarm')
  async soundAlarm(@Request() req: AuthRequest, @Param('id') id: string) {
    if (Number.isNaN(+id)) {
      throw new BadRequestException('Id is not a number');
    }

    return `Alarm sound triggered on device ${id}`;
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
  @ApiOperation({ summary: 'Mark a device as lost' })
  @ApiBody({ type: LostDeviceDTO, description: 'Details of the lost device' })
  @ApiResponse({
    status: 200,
    description: 'Device marked as lost',
    type: DeviceDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  setDeviceIsLost(@Body() lostDTO: LostDeviceDTO) {
    return this.deviceService.lostDevice(lostDTO);
  }
}
