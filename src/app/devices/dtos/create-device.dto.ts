import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateDeviceDTO {
  @IsNumber()
  @ApiProperty({
    example: 123,
    description: 'The unique identifier of the device',
  })
  id: number;
}
