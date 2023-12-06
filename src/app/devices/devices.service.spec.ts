import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DevicesService } from './devices.service';
import { Device } from '../../models/device.model';
import { User } from '../../models/user.model';
import timeoutPromise from '../../utils/timeoutPromise';

describe('DevicesService', () => {
  let service: DevicesService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          entities: [User],
          synchronize: true,
          autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([User, Device]),
        ConfigModule.forRoot({ isGlobal: true }),
      ],
      providers: [DevicesService],
    }).compile();

    service = moduleRef.get<DevicesService>(DevicesService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  const user = { id: 15, email: 'test@gmail.com' };
  const deviceDTO = { id: 0 };

  it('should add a new device', async () => {
    const createdDevice = await service.create(user as User, deviceDTO);

    expect(await service.findOne({ id: createdDevice.id })).toBeDefined();

    expect(createdDevice).toBeDefined();
    expect(createdDevice.id).toEqual(0);
    expect(createdDevice.user.id).toEqual(15);

    await service.remove({ id: createdDevice.id });
    expect(await service.findOne({ id: createdDevice.id })).toBeNull();
  });

  it('should find an existing device', async () => {
    const createdDevice = await service.create(user as User, deviceDTO);

    const foundDevice = await service.findOne({ id: createdDevice.id });

    expect(foundDevice).toBeDefined();
    expect(foundDevice.id).toEqual(createdDevice.id);
    expect(foundDevice.user.id).toEqual(user.id);

    await service.remove({ id: createdDevice.id });
    expect(await service.findOne({ id: createdDevice.id })).toBeNull();
  });

  it('should find all devices for a user', async () => {
    const createdDevice = await service.create(user as User, deviceDTO);

    const foundDevices = await service.find({ ...deviceDTO });

    expect(foundDevices).toHaveLength(1);

    await service.remove({ id: createdDevice.id });
    expect(await service.findOne({ id: createdDevice.id })).toBeNull();
  });

  it('should update an existing device', async () => {
    const createdDevice = await service.create(user as User, {
      ...deviceDTO,
      nfcData: '1',
    });

    let device = await service.findOne({ id: createdDevice.id });
    expect(device.nfcData).toEqual('1');

    await service.update({ id: device.id }, { nfcData: '2' });

    device = await service.findOne({ id: device.id });

    expect(device.nfcData).toEqual('2');

    await service.remove({ id: createdDevice.id });
    expect(await service.findOne({ id: createdDevice.id })).toBeNull();
  });

  it('should remove an existing device', async () => {
    const createdDevice = await service.create(user as User, deviceDTO);

    await service.remove({ id: createdDevice.id });

    const foundDevice = await service.findOne({ id: createdDevice.id });

    expect(foundDevice).toBeNull();
  });

  const userForCreate = { ...user, data: user as User };

  it('should create a device, wait for 20s, and then check if device was deleted', async () => {
    const createdDevice = await service.addDevice(deviceDTO, userForCreate);

    await timeoutPromise(20);
    expect(await service.findOne({ id: createdDevice.id })).toBeNull();
  }, 25000);

  it('should create a device, approve it, wait for 20s, and then check if it still exists', async () => {
    const createdDevice = await service.addDevice(deviceDTO, userForCreate);

    await service.approveDevice({ id: createdDevice.id });

    await timeoutPromise(20);

    expect(await service.findOne({ id: createdDevice.id })).toBeDefined();

    await service.remove({ id: createdDevice.id });
    expect(await service.findOne({ id: createdDevice.id })).toBeNull();
  }, 25000);
});
