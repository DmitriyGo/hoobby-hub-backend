import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileController } from './profile.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JWT_SECRET } from '../../constants/auth';
import { Device } from '../../models/device.model';
import { User } from '../../models/user.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Device]),
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: JWT_SECRET,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
