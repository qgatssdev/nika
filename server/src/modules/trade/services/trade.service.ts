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
    const { userId, volume, fees = 0, payTokenType, getTokenType } = data;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referrer'],
    });

    if (!user) throw new NotFoundException('User not found');
    if (volume <= 0) throw new BadRequestException('Invalid volume');
    if (!payTokenType || !getTokenType)
      throw new BadRequestException('Invalid token types');
    if (payTokenType === getTokenType)
      throw new BadRequestException('Tokens must differ');

    const feeRate = fees / volume;

    this.logger.log(
      `User ${user.email} traded ${volume} ${payTokenType} → ${getTokenType} (fee rate: ${feeRate * 100}%)`,
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
      // 1) Deduct from payer wallet
      await this.decrementBalance(user.id, payTokenType, volume, manager);

      // 2) Credit receiver wallet with cashback in get token
      if (breakdown.cashback > 0) {
        await this.incrementBalance(
          user.id,
          getTokenType,
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
          tokenType: getTokenType,
          isClaimed: false,
        });

        await this.incrementBalance(
          level.userId,
          getTokenType,
          level.amount,
          manager,
        );
      }
    });

    //MOCKING TREASURY DISTRIBUTION
    this.logger.log(`Treasury distributed: ${breakdown.treasury}`);

    this.logger.log(
      `Processed trade for ${user.email}: volume ${volume} ${payTokenType} → ${getTokenType}, fees $${fees} distributed`,
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

  private async decrementBalance(
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
        balance: 0,
      })
      .onConflict(
        `("userId", "tokenType") DO UPDATE SET "balance" = GREATEST("user_wallets"."balance" - ${amount}, 0)`,
      )
      .execute();
  }
}
