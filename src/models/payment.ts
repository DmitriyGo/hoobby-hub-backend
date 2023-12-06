import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

import { Action, Reaction } from './commands';
import { User } from './user.model';

@Entity()
export class Payment {
  @PrimaryColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  date: Date;

  // @ManyToOne(() => User, (user) => user.payments)
  // user: User;
}
