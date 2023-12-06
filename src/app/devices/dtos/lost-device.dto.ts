import { IsBoolean, IsNumber } from 'class-validator';

export class LostDeviceDTO {
  @IsNumber()
  id: number;

  @IsBoolean()
  isLost: boolean;
}
