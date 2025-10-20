import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { User } from 'src/modules/auth/entity/user.entity';

@Entity('claim')
export class Claim extends BaseEntity {
  @ManyToOne(() => User, (user) => user.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  tokenType: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  claimedAt: Date;
}
