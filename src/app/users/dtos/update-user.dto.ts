import { IsEmail, IsString, IsOptional, Min, IsBoolean } from 'class-validator';

export class UpdateUserDTO {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Min(6)
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
