import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response, Request } from 'express';

import { User } from '@/models/user.model';

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
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile returned successfully',
    type: User,
  })
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  test1(@Req() request: AuthRequest) {
    return request.user;
  }

  @AdminAuth()
  @Get('profile-admin')
  @ApiOperation({ summary: 'Get admin user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin user profile returned successfully',
    type: User,
  })
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  test2(@Req() request: AuthRequest) {
    return request.user;
  }

  @Post('signin')
  @ApiOperation({ summary: 'User sign-in' })
  @ApiBody({
    type: SignInDTO,
    examples: {
      signInExample: {
        summary: 'Sign In Example',
        value: {
          email: 'user@example.com',
          password: 'Password123',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User signed in successfully',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
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
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User signed up successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiBody({
    type: SignUpDTO,
    examples: {
      signUpExample: {
        summary: 'Sign Up Example',
        value: {
          email: 'newuser@example.com',
          password: 'StrongPass!123',
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Log out a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
  })
  @ApiCookieAuth(REFRESH_TOKEN)
  @ApiBearerAuth()
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie(REFRESH_TOKEN, null, { maxAge: 0, httpOnly: true });
  }
}
