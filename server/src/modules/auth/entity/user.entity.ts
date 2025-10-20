import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/libs/core/base/BaseEntity';
import { Commission } from 'src/modules/referral/entity/commission.entity';
import { Referral } from 'src/modules/referral/entity/referral.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Claim } from 'src/modules/referral/entity/claim.entity';
import { UserWallet } from './user-wallet.entity';

@Entity('user')
export class User extends BaseEntity {
  @Column({ unique: true, type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @OneToMany(() => UserWallet, (wallet) => wallet.user)
  wallets: UserWallet[];

  @Column({ type: 'varchar', nullable: true, unique: true })
  referralCode: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'referrer' })
  referrer: User;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.01 })
  feeTier: number;
  //TODO: create endpoint to update fee tier, we should be looking at 0.5% for KOL's

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  cashbackPercent: number;

  @Column({ type: 'json', nullable: true })
  customCommissionStructure: Record<string, any>;

  @OneToMany(() => Commission, (commission) => commission.user)
  commissionsEarned: Commission[];

  @OneToMany(() => Claim, (claim) => claim.user)
  claims: Claim[];

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => Referral, (referral) => referral.referrer)
  referralsMade: Referral[];

  @OneToMany(() => Referral, (referral) => referral.referee)
  referralsReceived: Referral[];
}
