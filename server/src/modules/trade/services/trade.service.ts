import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { TradeWebhookDto } from '../dto/trade-webhook';
import { NotFoundException } from '@nestjs/common';
import { ReferralService } from 'src/modules/referral/services/referral.service';
import { UserRepository } from 'src/modules/auth/repository/user.repository';

@Injectable()
export class TradeService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly referralService: ReferralService;

  @Inject()
  private readonly userRepository: UserRepository;

  public async processTradeWebhook(data: TradeWebhookDto) {
    const { userId, volume, fees } = data;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referrer'],
    });

    if (!user) throw new NotFoundException('User not found');
    if (volume <= 0) throw new BadRequestException('Invalid trade volume');
    if (fees <= 0) throw new BadRequestException('Invalid fee amount');

    const feeRate = fees / volume;

    this.logger.log(
      `User ${user.email} traded volume $${volume} (fee rate: ${feeRate * 100}%)`,
    );

    const breakdown = await this.referralService.calculateFeeBreakdown(
      user.id,
      fees,
    );

    // Using atomic DB increments to prevent race conditions
    // when multiple trades are processed concurrently for the same users.
    if (breakdown.cashback > 0) {
      await this.userRepository.increment(
        { id: user.id },
        'walletBalance',
        breakdown.cashback,
      );
    }

    for (const level of Object.values(breakdown.commissions)) {
      await this.userRepository.increment(
        { id: level.userId },
        'walletBalance',
        level.amount,
      );
    }

    //MOCKING TREASURY DISTRIBUTION
    this.logger.log(`Treasury distributed: ${breakdown.treasury}`);

    this.logger.log(
      `Processed trade for ${user.email}: volume $${volume}, fees $${fees} distributed`,
    );

    return {
      message: 'Trade processed successfully',
      volume,
      fees,
      feeRate,
      breakdown,
    };
  }
}
