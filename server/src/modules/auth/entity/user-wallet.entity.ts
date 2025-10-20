import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';

@Entity('user_wallets')
@Unique(['user', 'tokenType'])
export class UserWallet extends BaseEntity {
  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  tokenType: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  claimedAmount: number;
}
