import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Device } from './device.model';
import { UserRole } from './user-role';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: 0 })
  balance: number;

  @OneToMany(() => Device, (device) => device.user, { cascade: true })
  devices: Device[];
}
