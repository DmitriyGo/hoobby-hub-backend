import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DevicesAdminController } from './devices-admin.controller';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { JWT_SECRET } from '../../constants/auth';
import { Device } from '../../models/device.model';
import { User } from '../../models/user.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Device]),
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [DevicesService],
  controllers: [DevicesController, DevicesAdminController],
  exports: [DevicesService],
})
export class DevicesModule {}
