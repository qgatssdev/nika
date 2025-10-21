import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/modules/auth/repository/user.repository';
import { handleErrorCatch } from 'src/libs/common/helpers/utils';
import { createReferralCode } from 'src/libs/common/helpers/utils';
import { ReferralRepository } from '../repository/referral.repository';
import { FeeBreakdown } from 'src/libs/common/constants/constants';
import { UserWallet } from 'src/modules/auth/entity/user-wallet.entity';
import { User } from 'src/modules/auth/entity/user.entity';
import { Commission } from 'src/modules/referral/entity/commission.entity';
import { Claim } from 'src/modules/referral/entity/claim.entity';
import { DataSource, In } from 'typeorm';
import { PaginatedQuery } from 'src/libs/core/base/paginated-query';
import {
  PaginatedResponse,
  Pagination,
} from 'src/libs/core/base/paginated.response';

type LevelKey = 'level1' | 'level2' | 'level3';
type ReferralNode = {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  wallets: UserWallet[];
};

@Injectable()
export class ReferralService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly userRepository: UserRepository;

  @Inject()
  private readonly dataSource: DataSource;

  @Inject()
  private readonly referralRepository: ReferralRepository;

  public async generateReferralCode(
    userId: string,
  ): Promise<{ referralCode: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.referralCode) {
        return { referralCode: user.referralCode };
      }

      user.referralCode = createReferralCode(user);

      await this.userRepository.save(user);

      return { referralCode: user.referralCode };
    } catch (error) {
      handleErrorCatch(error);
      throw error;
    }
  }

  public async registerReferral(referralCode: string, newUserId: string) {
    try {
      const newUser = await this.userRepository.findOne({
        where: { id: newUserId },
        relations: ['referrer'],
      });

      if (!newUser) throw new NotFoundException('User not found');

      const referrer = await this.userRepository.findOne({
        where: { referralCode },
        relations: ['referrer'],
      });

      if (!referrer) throw new BadRequestException('Invalid referral code');

      if (referrer.id === newUser.id) {
        throw new BadRequestException('You cannot refer yourself');
      }

      if (newUser.referrer) {
        throw new BadRequestException('User already has a referrer');
      }

      let level = 1;
      let currentReferrer = referrer;

      while (currentReferrer.referrer && level < 3) {
        currentReferrer = currentReferrer.referrer;
        level++;
      }

      if (level > 3) {
        this.logger.warn(
          `Referral depth exceeded for user ${referrer.id}. Proceeding without referral link.`,
        );
        return {
          message:
            'Referral depth limit reached. User registered without referral link.',
        };
      }

      await this.referralRepository.save({
        referrer,
        referee: newUser,
        level,
      });

      newUser.referrer = referrer;
      await this.userRepository.save(newUser);

      return { message: 'Referral registered successfully', level };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  public async validateReferralCode(referralCode: string): Promise<boolean> {
    const referrer = await this.userRepository.findOne({
      where: { referralCode },
    });
    return !!referrer;
  }

  public async getReferralNetwork(
    userId: string,
    query: PaginatedQuery,
  ): Promise<PaginatedResponse<ReferralNode[]> | undefined> {
    try {
      const { page = 1, size = 10, filterBy: level } = query;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      const result: Record<LevelKey, ReferralNode[]> = {
        level1: [],
        level2: [],
        level3: [],
      };

      const traverse = async (referrerId: string, currentLevel: number) => {
        if (currentLevel > 3) return;

        const referrals = await this.referralRepository.findAll({
          where: { referrer: { id: referrerId } },
          relations: ['referee'],
        });

        if (!referrals.length) return;

        for (const referral of referrals) {
          const levelKey = `level${currentLevel}` as LevelKey;

          result[levelKey].push({
            id: referral.referee.id,
            email: referral.referee.email,
            name: `${referral.referee.firstName} ${referral.referee.lastName}`,
            referralCode: referral.referee.referralCode,
            wallets: referral.referee.wallets,
          });

          await traverse(referral.referee.id, currentLevel + 1);
        }
      };

      await traverse(user.id, 1);

      const paginate = (
        data: ReferralNode[],
      ): PaginatedResponse<ReferralNode[]> => {
        const total = data.length;
        const startIndex = (page - 1) * size;
        const paginatedData = data.slice(startIndex, startIndex + size);

        const pagination: Pagination = {
          page,
          size,
          total,
        };

        return PaginatedResponse.successResponse(paginatedData, pagination);
      };

      if (level && ['level1', 'level2', 'level3'].includes(level)) {
        const levelKey = level as LevelKey;
        return paginate(result[levelKey]);
      }

      const allReferrals = [
        ...result.level1,
        ...result.level2,
        ...result.level3,
      ];

      return paginate(allReferrals);
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async getReferralEarnings(userId: string, query: PaginatedQuery) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: [
          'referralsMade',
          'referralsMade.referee',
          'referralsMade.referee.wallets',
        ],
      });

      if (!user) throw new NotFoundException('User not found');

      const page = query.page || 1;
      const size = query.size || 10;

      const result = {
        level1: { claimed: 0, unclaimed: 0, total: 0 },
        level2: { claimed: 0, unclaimed: 0, total: 0 },
        level3: { claimed: 0, unclaimed: 0, total: 0 },
        overall: { claimed: 0, unclaimed: 0, total: 0 },
      };

      const traverse = async (referrerId: string, currentLevel: number) => {
        if (currentLevel > 3) return;

        const levelReferrals = await this.referralRepository.findAll({
          where: { referrer: { id: referrerId } },
          relations: ['referee', 'referee.wallets'],
        });

        for (const referral of levelReferrals) {
          const wallet = referral.referee.wallets?.[0];
          if (wallet) {
            const claimed = Number(wallet.claimedAmount || 0);
            const unclaimed = Number(wallet.balance || 0);
            const total = claimed + unclaimed;
            const levelKey = `level${currentLevel}` as keyof typeof result;

            result[levelKey].claimed += claimed;
            result[levelKey].unclaimed += unclaimed;
            result[levelKey].total += total;

            result.overall.claimed += claimed;
            result.overall.unclaimed += unclaimed;
            result.overall.total += total;
          }

          await traverse(referral.referee.id, currentLevel + 1);
        }
      };

      await traverse(user.id, 1);

      const pagination = {
        total: user.referralsMade.length,
        size,
        page,
      };

      return PaginatedResponse.successResponse(
        result,
        pagination,
        'Referral earnings retrieved successfully',
      );
    } catch (error) {
      handleErrorCatch(error);
      throw error;
    }
  }

  public async calculateFeeBreakdown(
    userId: string,
    feeAmount: number,
    cashbackPercent: number = 0.1,
  ): Promise<FeeBreakdown> {
    const DEFAULT_COMMISSIONS = { level1: 0.3, level2: 0.03, level3: 0.02 };

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'referrer',
        'referrer.referrer',
        'referrer.referrer.referrer',
      ],
    });

    if (!user) throw new NotFoundException('User not found');

    // waived fees / commissions
    if (user.customCommissionStructure?.waivedFees) {
      return {
        totalFee: feeAmount,
        cashback: 0,
        treasury: feeAmount,
        commissions: {},
      };
    }

    // use custom structures if they exist
    const customStructure = user.customCommissionStructure || {};
    const COMMISSIONS = customStructure.levelCommissions || DEFAULT_COMMISSIONS;
    const directCommission =
      customStructure.directCommission ?? DEFAULT_COMMISSIONS.level1;

    const cashback =
      user.cashbackPercent !== null && user.cashbackPercent !== undefined
        ? feeAmount * Number(user.cashbackPercent)
        : feeAmount * cashbackPercent;

    const commissions: FeeBreakdown['commissions'] = {};

    let currentReferrer: User | null = user.referrer;
    let level = 1;

    while (currentReferrer && level <= 3) {
      const percent =
        (level === 1 ? directCommission : COMMISSIONS[`level${level}`]) || 0;
      const amount = feeAmount * percent;

      commissions[`level${level}` as keyof typeof COMMISSIONS] = {
        userId: currentReferrer.id,
        percent,
        amount,
      };

      currentReferrer =
        currentReferrer.referrer && level < 3 ? currentReferrer.referrer : null;
      level++;
    }

    const treasury =
      feeAmount -
      (cashback +
        Object.values(commissions).reduce(
          (sum, c) => sum + (c?.amount ?? 0),
          0,
        ));

    return {
      totalFee: feeAmount,
      cashback,
      treasury,
      commissions,
    };
  }

  async getClaimableByToken(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const commissionRepo = this.dataSource.getRepository(Commission);
      const rows = await commissionRepo
        .createQueryBuilder('c')
        .select('"c"."tokenType"', 'tokenType')
        .addSelect('SUM(CAST("c"."amount" as decimal))', 'amount')
        .where('"c"."user" = :userId AND "c"."isClaimed" = false', {
          userId,
        })
        .groupBy('"c"."tokenType"')
        .getRawMany();

      return rows.map((r) => ({
        tokenType: r.tokenType as string,
        amount: Number(r.amount),
      }));
    } catch (error) {
      handleErrorCatch(error);
      throw error;
    }
  }

  async claimCommission(userId: string, tokenType: string) {
    return await this.dataSource.transaction(async (manager) => {
      // Rebind repositories to the transaction manager
      const userRepo = manager.getRepository(User);
      const commissionRepo = manager.getRepository(Commission);
      const claimRepo = manager.getRepository(Claim);
      const walletRepo = manager.getRepository(UserWallet);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const commissions = await commissionRepo.find({
        where: { user: { id: userId }, isClaimed: false, tokenType },
      });

      const totalClaimable = commissions.reduce(
        (sum, c) => sum + parseFloat(c.amount),
        0,
      );

      if (totalClaimable <= 0) {
        throw new BadRequestException('No claimable commissions');
      }

      await commissionRepo.update(
        { user: { id: userId }, tokenType, isClaimed: false },
        { isClaimed: true },
      );

      const claim = claimRepo.create({
        user,
        tokenType,
        amount: totalClaimable.toFixed(8),
      });

      await claimRepo.save(claim);

      const existingWallet = await walletRepo.findOne({
        where: { user: { id: userId }, tokenType },
      });

      if (!existingWallet) {
        throw new BadRequestException(
          `No wallet found for user ${userId} and token ${tokenType}`,
        );
      }

      const currentBalance = Number(existingWallet.balance);
      const rawNewBalance = currentBalance - totalClaimable;
      const newBalance = rawNewBalance < 0 ? 0 : rawNewBalance;
      const roundedBalance = Math.round(newBalance * 1e8) / 1e8;

      const currentClaimed = Number(existingWallet.claimedAmount || 0);
      const newClaimed = currentClaimed + totalClaimable;
      const roundedClaimed = Math.round(newClaimed * 1e8) / 1e8;

      await walletRepo.update(
        { user: { id: userId }, tokenType },
        { balance: roundedBalance, claimedAmount: roundedClaimed },
      );

      return {
        message: `Successfully claimed ${totalClaimable} ${tokenType}`,
        amount: totalClaimable,
        tokenType,
      };
    });
  }
}
