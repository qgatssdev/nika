import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { SharedModule } from 'src/shared/shared.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { FirebaseAuthService } from 'src/infra/auth/firebase-auth.service';
import { YadsaleModule } from '../yadsale/yadsale.module';
import { OtpRepository } from './repository/otp.repository';

@Module({
  imports: [SharedModule, YadsaleModule],
  controllers: [AuthController, UserController],
  providers: [
    UserRepository,
    AuthService,
    UserService,
    FirebaseAuthService,
    OtpRepository,
  ],
})
export class AuthModule {}
