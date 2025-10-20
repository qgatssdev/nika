import { Module } from '@nestjs/common';
import { TradeService } from './services/trade.service';
import { ReferralModule } from '../referral/referral.module';
import { TradeController } from './controllers/trade.controller';
import { UserRepository } from '../auth/repository/user.repository';

@Module({
  imports: [ReferralModule, UserRepository],
  controllers: [TradeController],
  providers: [TradeService, UserRepository],
  exports: [TradeService],
})
export class TradeModule {}
