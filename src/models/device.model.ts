import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

import { Action } from './commands';
import { User } from './user.model';

@Entity()
export class Device {
  @PrimaryColumn()
  id: number;

  @Column({ default: '' })
  action: Action;

  @Column({ default: '' })
  nfcData: string;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: new Date() })
  lastTimeOnline: Date;

  @Column({ default: false })
  turnedOff: boolean;

  @Column({ default: false })
  isLost: boolean;

  @ManyToOne(() => User, (user) => user.devices)
  user: User;
}
