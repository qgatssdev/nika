import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { handleErrorCatch } from 'src/libs/common/helpers/utils';
import { User } from '../entity/user.entity';
import { UpdateCustomStructureDto } from '../dto/update-custom-structure.dto';

@Injectable()
export class UserService {
  private logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly userRepository: UserRepository;

  async getAuthenticatedUser(user: User) {
    try {
      const authenticatedUser = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['wallets', 'commissionsEarned', 'claims'],
        order: {
          commissionsEarned: {
            amount: 'DESC',
          },
        },
      });

      return authenticatedUser;
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async updateCustomStructure(userId: string, dto: UpdateCustomStructureDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const existing = user.customCommissionStructure || {};
      user.customCommissionStructure = {
        ...existing,
        isKOL: dto.isKOL,
        directCommission: dto.directCommission,
        levelCommissions: dto.levelCommissions,
        waivedFees: dto.waivedFees,
      };

      await this.userRepository.save(user);

      this.logger.log(`Updated custom commission structure for user ${userId}`);

      return {
        message: 'Custom commission structure updated successfully',
        userId,
        customCommissionStructure: user.customCommissionStructure,
      };
    } catch (error) {
      handleErrorCatch(error);
      throw error;
    }
  }
}
