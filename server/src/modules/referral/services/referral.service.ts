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

type LevelKey = 'level1' | 'level2' | 'level3';
type ReferralNode = {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  walletBalance: string;
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

  public async getReferralTree(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['referralsMade', 'referralsMade.referee'],
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
            walletBalance: referral.referee.walletBalance,
          });

          await traverse(referral.referee.id, currentLevel + 1);
        }
      };

      await traverse(user.id, 1);

      return result;
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  public async calculateFeeBreakdown(
    userId: string,
    feeAmount: number,
    cashbackPercent: number = 0.1,
  ): Promise<FeeBreakdown> {
    const COMMISSIONS = { level1: 0.3, level2: 0.03, level3: 0.02 }; // default

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['referrer'],
    });

    if (!user) throw new NotFoundException('User not found');

    const cashback = feeAmount * cashbackPercent;

    const commissions: FeeBreakdown['commissions'] = {};
    let currentReferrer = user.referrer;
    let level = 1;

    while (currentReferrer && level <= 3) {
      const percent = COMMISSIONS[`level${level}` as keyof typeof COMMISSIONS];
      const amount = feeAmount * percent;

      commissions[`level${level}` as keyof typeof COMMISSIONS] = {
        userId: currentReferrer.id,
        percent,
        amount,
      };

      const refLink = await this.referralRepository.findOne({
        where: { referee: { id: currentReferrer.id } },
        relations: ['referrer'],
      });

      currentReferrer = refLink?.referrer ?? null;
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
}
