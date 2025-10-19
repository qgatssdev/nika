import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [AuthModule, ReferralModule],
  exports: [AuthModule, ReferralModule],
})
export class DomainModule {}
