import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AES, enc } from 'crypto-js';

import { JWTUserDTO, SignInDTO, SignUpDTO } from './dtos/user.dto';
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  JWT_SECRET,
} from '../../constants/auth';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private jwtSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecret = JWT_SECRET;
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }
  }

  removeUser(email: string) {
    return this.usersService.removeBy({ email });
  }

  createToken = (payload: JWTUserDTO, expiresInSeconds: number) => {
    return this.jwtService.signAsync(payload, {
      expiresIn: `${expiresInSeconds}ms`,
      secret: this.jwtSecret,
    });
  };

  crypt(stringToCrypt: string): string {
    return AES.encrypt(stringToCrypt, this.jwtSecret).toString();
  }

  decrypt(stringToDecrypt: string): string {
    const bytes = AES.decrypt(stringToDecrypt, this.jwtSecret);
    return bytes.toString(enc.Utf8);
  }

  async signInUser(
    userDTO: SignInDTO,
    withRefreshToken: boolean,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const user = await this.usersService.findOne({ email: userDTO.email });

    if (!user) {
      throw new UnauthorizedException(
        `Cant find user with such credentials: ${JSON.stringify(userDTO)}`,
      );
    }

    if (userDTO.password !== this.decrypt(user.password)) {
      throw new UnauthorizedException(
        `Cant find user with such credentials: ${JSON.stringify(userDTO)}`,
      );
    }

    const payload = { id: user.id, email: user.email };

    const accessTokenPromise = this.createToken(payload, ACCESS_TOKEN_EXPIRES);

    if (withRefreshToken) {
      const refreshTokenPromise = this.createToken(
        payload,
        REFRESH_TOKEN_EXPIRES,
      );

      const [accessToken, refreshToken] = await Promise.all([
        accessTokenPromise,
        refreshTokenPromise,
      ]);

      return {
        accessToken,
        refreshToken,
      };
    }

    return {
      accessToken: await accessTokenPromise,
    };
  }

  async signUpUser(userDTO: SignUpDTO) {
    if (await this.usersService.findOne({ email: userDTO.email })) {
      throw new BadRequestException('Email is already taken');
    }

    const password = this.crypt(userDTO.password);

    const user = await this.usersService.create({
      email: userDTO.email,
      password,
    });

    const payload = { id: user.id, email: user.email };

    const access = this.createToken(payload, ACCESS_TOKEN_EXPIRES);
    const refresh = this.createToken(payload, REFRESH_TOKEN_EXPIRES);

    const [accessToken, refreshToken] = await Promise.all([access, refresh]);

    return { accessToken, refreshToken };
  }
}
