import { Expose } from 'class-transformer';

import { DeviceDTO } from '../../devices/dtos/device.dto';

export class UserDTO {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  devices: DeviceDTO[];
}
