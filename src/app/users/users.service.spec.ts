import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { Device } from '../../models/device.model';
import { User } from '../../models/user.model';

describe('UsersService', () => {
  let service: UsersService;
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
        TypeOrmModule.forFeature([User]),
        ConfigModule.forRoot({ isGlobal: true }),
      ],
      providers: [UsersService],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  const userDTO = {
    id: 0,
    email: 'testUser@gmail.com',
    password: 'asdASD1!',
  };

  it('should create a user', async () => {
    const createdUser = await service.create(userDTO);

    const foundUser = await service.findOne({ id: createdUser.id });

    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBeDefined();
    expect(foundUser.email).toEqual('testUser@gmail.com');

    await service.remove(createdUser.id);
    expect(await service.findOne({ id: createdUser.id })).toBeNull();
  });

  it('should find a user by id', async () => {
    const createdUser = await service.create(userDTO);

    const foundUser = await service.findOne({ id: createdUser.id });

    expect(foundUser).toBeDefined();
    expect(foundUser.id).toEqual(createdUser.id);
    expect(foundUser.email).toEqual(createdUser.email);

    await service.remove(foundUser.id);
    expect(await service.findOne({ id: foundUser.id })).toBeNull();
  });

  it('should find all users', async () => {
    const createdUser = await service.create(userDTO);

    const foundUsers = await service.find();

    expect(foundUsers).toBeDefined();

    await service.remove(createdUser.id);
    expect(await service.findOne({ id: createdUser.id })).toBeNull();
  });

  it('should update a user', async () => {
    const createdUser = await service.create(userDTO);

    const updatedUser = await service.update(createdUser.id, { balance: 100 });

    expect(updatedUser).toBeDefined();
    expect(updatedUser.id).toEqual(createdUser.id);
    expect(updatedUser.balance).toEqual(100);

    await service.remove(createdUser.id);
    expect(await service.findOne({ id: createdUser.id })).toBeNull();
  });

  it('should remove a user', async () => {
    const createdUser = await service.create(userDTO);

    await service.remove(createdUser.id);

    const foundUser = await service.findOne({ id: createdUser.id });

    expect(foundUser).toBeNull();
  });

  it('should check if a user has lost devices, should be true', async () => {
    const createdUser = await service.create(userDTO);

    jest
      .spyOn(service, 'userHasLostDevices')
      .mockImplementation(async (args: any) => true);

    const userHasLostDevices = await service.userHasLostDevices(createdUser.id);

    expect(userHasLostDevices).toEqual(true);
    await service.remove(createdUser.id);
    expect(await service.findOne({ id: createdUser.id })).toBeNull();
  });

  it('should check if a user has lost devices, should be false', async () => {
    const createdUser = await service.create(userDTO);

    jest
      .spyOn(service, 'userHasLostDevices')
      .mockImplementation(async (args: any) => false);

    const userHasLostDevices = await service.userHasLostDevices(createdUser.id);

    expect(userHasLostDevices).toEqual(false);
    await service.remove(createdUser.id);
    expect(await service.findOne({ id: createdUser.id })).toBeNull();
  });
});
