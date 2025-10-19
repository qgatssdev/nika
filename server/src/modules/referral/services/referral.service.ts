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
      });

      if (!newUser) throw new NotFoundException('User not found');

      const referrer = await this.userRepository.findOne({
        where: { referralCode },
      });

      if (!referrer) throw new BadRequestException('Invalid referral code');

      if (referrer.id === newUser.id) {
        throw new BadRequestException('You cannot refer yourself');
      }

      if (newUser.referrer) {
        throw new BadRequestException('User already has a referrer');
      }

      const currentReferralCount = await this.referralRepository.count({
        where: { referrer },
      });

      if (currentReferralCount >= 3) {
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
        level: currentReferralCount + 1,
      });

      newUser.referrer = referrer;
      await this.userRepository.save(newUser);

      return { message: 'Referral registered successfully' };
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
}
