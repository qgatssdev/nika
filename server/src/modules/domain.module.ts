import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReferralModule } from './referral/referral.module';
import { TradeModule } from './trade/trade.module';

@Module({
  imports: [AuthModule, ReferralModule, TradeModule],
  exports: [AuthModule, ReferralModule],
})
export class DomainModule {}
