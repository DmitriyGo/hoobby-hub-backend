import { Expose } from 'class-transformer';

import { Action } from '../../../models/commands';

export class DeviceDTO {
  @Expose()
  id: number;

  @Expose()
  action: Action;

  @Expose()
  nfcData: string;

  @Expose()
  isLost: boolean;

  @Expose()
  lastTimeOnline: Date;
}
