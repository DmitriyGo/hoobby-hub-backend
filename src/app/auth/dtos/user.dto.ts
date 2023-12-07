import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignUpDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}

export class SignInDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}

export class JWTUserDTO {
  id: number;
  email: string;
}

export class UserDTOVerified {
  id: number;
  email: string;
  iat: number;
  exp: number;
}
