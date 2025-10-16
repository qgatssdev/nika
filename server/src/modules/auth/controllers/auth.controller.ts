import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SignUpDto } from '../dto/signup.dto';
import { AuthService } from '../services/auth.service';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto) {
    return await this.authService.login(loginRequestDto);
  }
}
