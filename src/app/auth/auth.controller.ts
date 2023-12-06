import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

import { AuthRequest } from './auth-request.interface';
import { AuthService } from './auth.service';
import { SignInDTO, SignUpDTO } from './dtos/user.dto';
import { REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES } from '../../constants/auth';
import { UseAuth, AdminAuth } from '../../decorators/auth';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseAuth()
  @Get('profile')
  test1(@Req() request: AuthRequest) {
    return request.user;
  }

  @AdminAuth()
  @Get('profile-admin')
  test2(@Req() request: AuthRequest) {
    return request.user;
  }

  @Post('signin')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() userDTO: SignInDTO,
  ) {
    try {
      if (request.cookies[REFRESH_TOKEN]) {
        return this.authService.signInUser(userDTO, false);
      }

      const { accessToken, refreshToken } = await this.authService.signInUser(
        userDTO,
        true,
      );

      response.cookie(REFRESH_TOKEN, refreshToken, {
        maxAge: REFRESH_TOKEN_EXPIRES,
        httpOnly: true,
      });

      console.log('Generated refresh for login');

      return { accessToken };
    } catch (e: any) {
      response.status(401).send(e.message);
    }
  }

  @Post('signup')
  async signUp(
    @Res({ passthrough: true }) response: Response,
    @Body() user: SignUpDTO,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUpUser(user);

    response.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRES,
    });

    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie(REFRESH_TOKEN, null, { maxAge: 0, httpOnly: true });
  }
}
