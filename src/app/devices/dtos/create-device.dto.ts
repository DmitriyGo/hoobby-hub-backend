import { IsNumber } from 'class-validator';

export class CreateDeviceDTO {
  @IsNumber()
  id: number;
}
