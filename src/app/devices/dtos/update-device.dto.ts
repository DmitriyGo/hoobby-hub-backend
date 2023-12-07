import { IsOptional, IsString } from 'class-validator';

import { Action } from '../../../models/commands';

export class UpdateDeviceDTO {
  @IsOptional()
  action: Action;

  @IsString()
  @IsOptional()
  nfcData: string;
}
