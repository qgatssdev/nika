import { forwardRef, Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { ReferralModule } from '../referral/referral.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [forwardRef(() => ReferralModule)],
  controllers: [AuthController, UserController],
  providers: [UserRepository, AuthService, UserService],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
