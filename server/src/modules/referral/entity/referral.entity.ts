import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/auth/entity/user.entity';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';

@Entity({ name: 'referrals' })
export class Referral extends BaseEntity {
  @ManyToOne(() => User, (user) => user.referralsMade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @ManyToOne(() => User, (user) => user.referralsReceived, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'refereeId' })
  referee: User;

  @Column({ type: 'int' })
  level: number;
}
