import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { SECRET } from '../../constants/auth';
import { User } from '../../models/user.model';
import { UsersModule } from '../users/users.module';

describe('AuthService', () => {
  let service: AuthService;
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
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>(SECRET),
          }),
          inject: [ConfigService],
        }),
        UsersModule,
      ],
      providers: [AuthService],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sing up and sign in user', async () => {
    const userDTO = { email: 'test@gmail.com', password: 'asdASD1!' };

    expect(await service.signUpUser(userDTO)).toBeDefined();
    expect(await service.signInUser(userDTO, true)).toBeDefined();

    expect(await service.removeUser(userDTO.email)).toBeDefined();
  });
});
