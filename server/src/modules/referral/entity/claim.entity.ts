import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { User } from 'src/modules/auth/entity/user.entity';

@Entity('claim')
export class Claim extends BaseEntity {
  @ManyToOne(() => User, (user) => user.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 10 })
  tokenType: string;
}
