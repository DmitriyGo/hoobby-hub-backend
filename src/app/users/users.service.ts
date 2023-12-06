import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { DEVICE_LOST } from '../../constants/devices';
import { Device } from '../../models/device.model';
import { User } from '../../models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(user: DeepPartial<User>) {
    const userEntity = this.repo.create(user);

    return this.repo.save(userEntity);
  }

  findOne(options?: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    if (!options) {
      return null;
    }

    return this.repo.findOne({ where: options, relations: { devices: true } });
  }

  find(options?: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    if (!options) {
      return null;
    }

    return this.repo.find({ where: options, relations: { devices: true } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne({ id });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne({ id });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.repo.remove(user);
  }

  async removeBy(options?: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    const user = await this.findOne(options);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.repo.remove(user);
  }

  async userHasLostDevices(id: number) {
    const user = await this.findOne({ id });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user.devices?.some((device) => this.checkDeviceDate(device));
  }

  checkDeviceDate(device: Device) {
    return (
      !device.turnedOff &&
      Date.now() - device.lastTimeOnline.getTime() > DEVICE_LOST
    );
  }
}
