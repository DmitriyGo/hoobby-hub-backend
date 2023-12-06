import { Expose } from 'class-transformer';

import { Action, Reaction } from '../../../models/commands';

export class DeviceDTO {
  @Expose()
  id: number;

  @Expose()
  action: Action;

  @Expose()
  reaction: Reaction;

  @Expose()
  nfcData: string;

  @Expose()
  isLost: boolean;

  @Expose()
  lastTimeOnline: Date;
}
