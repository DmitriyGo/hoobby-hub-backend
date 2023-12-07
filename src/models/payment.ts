import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';

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
