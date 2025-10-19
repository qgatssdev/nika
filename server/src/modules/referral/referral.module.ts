import { forwardRef, Module } from '@nestjs/common';
import { ReferralRepository } from './repository/referral.repository';
import { ReferralService } from './services/referral.service';
import { ReferralController } from './controllers/referral.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ReferralController],
  providers: [ReferralRepository, ReferralService],
  exports: [ReferralService, ReferralRepository],
})
export class ReferralModule {}
