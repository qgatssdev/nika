import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReferralService } from '../services/referral.service';
import { AuthGuard } from 'src/libs/common/guards/auth.guard';
import { GenerateReferralDto } from '../dto/generate-referral';
import { RegisterReferralDto } from '../dto/register-referral';
import { CurrentUser } from 'src/libs/common/decorators/current-user.decorator';
import { User } from 'src/modules/auth/entity/user.entity';

@Controller({
  path: 'referral',
  version: '1',
})
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @UseGuards(AuthGuard)
  @Post('generate')
  async generateReferral(@Body() generateReferralDto: GenerateReferralDto) {
    const userId = generateReferralDto.userId;
    return this.referralService.generateReferralCode(userId);
  }

  @Post('register')
  async registerReferral(@Body() registerReferralDto: RegisterReferralDto) {
    const { referralCode, userId } = registerReferralDto;
    return await this.referralService.registerReferral(referralCode, userId);
  }

  @UseGuards(AuthGuard)
  @Get('network')
  async getNetwork(@CurrentUser() user: User) {
    return await this.referralService.getReferralTree(user.id);
  }
}
