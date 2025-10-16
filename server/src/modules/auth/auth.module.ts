import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';

@Module({
  controllers: [AuthController],
  providers: [UserRepository, AuthService, UserService],
})
export class AuthModule {}
