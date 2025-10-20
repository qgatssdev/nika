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
import { UserWallet } from 'src/modules/auth/entity/user-wallet.entity';
import { DataSource, EntityManager } from 'typeorm';
import { Commission } from 'src/modules/referral/entity/commission.entity';

@Injectable()
export class TradeService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly referralService: ReferralService;

  @Inject()
  private readonly dataSource: DataSource;

  @Inject()
  private readonly userRepository: UserRepository;

  public async processTradeWebhook(data: TradeWebhookDto) {
    const { userId, volume, fees, tokenType } = data;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referrer'],
    });

    if (!user) throw new NotFoundException('User not found');
    if (volume <= 0) throw new BadRequestException('Invalid trade volume');
    if (fees <= 0) throw new BadRequestException('Invalid fee amount');
    if (!tokenType) throw new BadRequestException('Invalid token type');

    const feeRate = fees / volume;

    this.logger.log(
      `User ${user.email} traded volume $${volume} (fee rate: ${feeRate * 100}%)`,
    );

    const breakdown = await this.referralService.calculateFeeBreakdown(
      user.id,
      fees,
    );

    if (user.customCommissionStructure?.waivedFees) {
      this.logger.log(
        `User ${user.email} has waived fees,  treasury receives all.`,
      );
    }

    if (user.customCommissionStructure?.directCommission) {
      this.logger.log(
        `User ${user.email} has custom direct commission of ${user.customCommissionStructure.directCommission * 100}%`,
      );
    }

    // Perform commission records creation and wallet increments atomically
    await this.dataSource.transaction(async (manager) => {
      if (breakdown.cashback > 0) {
        await this.incrementBalance(
          user.id,
          tokenType,
          breakdown.cashback,
          manager,
        );
      }

      for (const [idx, level] of Object.values(
        breakdown.commissions,
      ).entries()) {
        // Save commission record for each referrer level
        await manager.getRepository(Commission).save({
          user: { id: level.userId },
          sourceUser: { id: user.id },
          level: idx + 1,
          amount: Number(level.amount).toFixed(8),
          tokenType,
          isClaimed: false,
        });

        await this.incrementBalance(
          level.userId,
          tokenType,
          level.amount,
          manager,
        );
      }
    });

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

  private async incrementBalance(
    userId: string,
    tokenType: string,
    amount: number,
    manager: EntityManager,
  ) {
    await manager
      .createQueryBuilder()
      .insert()
      .into(UserWallet)
      .values({
        user: { id: userId },
        tokenType,
        balance: amount,
      })
      .onConflict(
        `("userId", "tokenType") DO UPDATE SET "balance" = "user_wallets"."balance" + EXCLUDED."balance"`,
      )
      .execute();
  }
}
