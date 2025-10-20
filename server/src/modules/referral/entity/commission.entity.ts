import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/auth/entity/user.entity';

@Entity({ name: 'commissions' })
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.commissionsEarned, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sourceUser' })
  sourceUser: User;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 50 })
  tokenType: string;

  @Column({ type: 'boolean', default: false })
  isClaimed: boolean;
}
