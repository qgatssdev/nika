import { forwardRef, Module } from '@nestjs/common';
import { ReferralRepository } from './repository/referral.repository';
import { ReferralService } from './services/referral.service';
import { ReferralController } from './controllers/referral.controller';
import { AuthModule } from '../auth/auth.module';
import { ClaimRepository } from './repository/claim.repository';
import { CommissionRepository } from './repository/commission.repository';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ReferralController],
  providers: [
    ReferralRepository,
    ReferralService,
    ClaimRepository,
    CommissionRepository,
  ],
  exports: [
    ReferralService,
    ReferralRepository,
    ClaimRepository,
    CommissionRepository,
  ],
})
export class ReferralModule {}
