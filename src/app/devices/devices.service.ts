import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';

import { ApproveDeviceDTO } from './dtos/approve-device.dto';
import { CreateDeviceDTO } from './dtos/create-device.dto';
import { LostDeviceDTO } from './dtos/lost-device.dto';
import { APPROVE_CHECK } from '../../constants/devices';
import { Device } from '../../models/device.model';
import { User } from '../../models/user.model';
import { JWTUserDTO } from '../auth/dtos/user.dto';

@Injectable()
export class DevicesService {
  constructor(@InjectRepository(Device) private repo: Repository<Device>) {}

  async test(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('Hello'), 5000);
    });
  }

  async addDevice(
    createDeviceDTO: CreateDeviceDTO,
    user: JWTUserDTO & {
      data?: User;
    },
  ) {
    const entityWithId = await this.findOne({
      id: createDeviceDTO.id,
      user: { id: user.id },
    });

    if (!!entityWithId) {
      throw new ForbiddenException();
    }

    setTimeout(async () => {
      const entityForApprove = await this.findOne({
        id: createDeviceDTO.id,
        user: { id: user.id },
      });

      if (!entityForApprove.approved) {
        await this.remove({
          id: entityForApprove.id,
          user: { id: user.id },
        });
      }
    }, APPROVE_CHECK);

    return this.create(user.data, {
      id: createDeviceDTO.id,
      user: { id: user.id },
    });
  }

  async approveDevice(approveDeviceDTO: ApproveDeviceDTO) {
    const entityForApprove = await this.findOne({
      id: +approveDeviceDTO.id,
    });

    this.update(
      { user: entityForApprove.user },
      { ...entityForApprove, approved: true },
    );
  }

  async getDataForDevice(deviceId: number) {
    const device = await this.repo.findOne({
      where: { id: deviceId },
    });

    device.lastTimeOnline = new Date();
    device.turnedOff = false;

    return this.repo.save(device);
  }

  async turnOffDevice(deviceId: number) {
    const device = await this.repo.findOne({
      where: { id: deviceId },
      relations: { user: true },
    });

    device.lastTimeOnline = new Date();
    device.turnedOff = true;

    return this.repo.save(device);
  }

  async lostDevice(lostDTO: LostDeviceDTO) {
    const device = await this.repo.findOne({
      where: { id: lostDTO.id },
      relations: { user: true },
    });

    device.isLost = lostDTO.isLost;

    this.repo.save(device);
  }

  create(user: User, entity: DeepPartial<Device>) {
    const createdEntity = this.repo.create({ ...entity, user });

    return this.repo.save(createdEntity);
  }

  findOne(options?: FindOptionsWhere<Device> | FindOptionsWhere<Device>[]) {
    if (!options) {
      return null;
    }

    return this.repo.findOne({ where: options, relations: { user: true } });
  }

  find(options?: FindOptionsWhere<Device> | FindOptionsWhere<Device>[]) {
    if (!options) {
      return null;
    }

    return this.repo.find({ where: options, relations: { user: true } });
  }

  async update(
    options: FindOptionsWhere<Device> | FindOptionsWhere<Device>[],
    data: Partial<Device>,
  ) {
    const entity = await this.findOne(options);

    if (!entity) {
      throw new NotFoundException('Device not found');
    }

    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async remove(
    options?: FindOptionsWhere<Device> | FindOptionsWhere<Device>[],
  ) {
    const entity = await this.findOne(options);

    if (!entity) {
      throw new NotFoundException(`Device wasn't found`);
    }

    return this.repo.remove(entity);
  }

  getDeviceLocation(id) {
    const latitude = Math.random() * 180 - 90;
    const longitude = Math.random() * 360 - 180;
    return `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(
      6,
    )}`;
  }
}
