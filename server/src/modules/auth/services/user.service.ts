import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import {
  getMediaUrl,
  handleErrorCatch,
  validateFile,
} from 'src/libs/common/helpers/utils';
import { User } from '../entity/user.entity';
import { PaginatedQuery } from 'src/libs/common/types/global-types';
import { YadsaleItemOfferRepository } from 'src/modules/yadsale/repository/yadsale-offer.repository';
import { UpdateUserDto } from '../dto/update-user-dto';
import { YadsaleItemRepository } from 'src/modules/yadsale/repository/yadsale-item.repository';
import { BuyerApprovalStatus, Events } from 'src/libs/common/constants';
import { EmailService } from 'src/shared/services/email.service';
import { UpdateUserQueryDto } from '../dto/update-user-query.dto';
import { Raw, Between } from 'typeorm';
import { PasswordEncoder } from 'src/infra/password-encoder/password-encoder';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Config } from 'src/config';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { FileUploadService } from 'src/shared/services/file-upload.service';
import { OnEvent } from '@nestjs/event-emitter';
import { YadsaleItemOffer } from 'src/modules/yadsale/entity/yadsale-item-offer.entity';

@Injectable()
export class UserService {
  private logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly userRepository: UserRepository;

  @Inject()
  private readonly yadsaleItemOfferRepository: YadsaleItemOfferRepository;

  @Inject()
  private readonly yadsaleItemRepository: YadsaleItemRepository;

  @Inject()
  private readonly emailService: EmailService;

  @Inject()
  private readonly fileUploadService: FileUploadService;

  async updateUsername(username: string, user: User) {
    try {
      await this.checkUsernameAvailability(username);
      const updatedUser = await this.userRepository.findOneAndUpdate(
        { id: user.id },
        { username },
      );

      return {
        message: 'Username updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
        },
      };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async checkUsernameAvailability(username: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          username: Raw((alias) => `LOWER(${alias}) = :username`, {
            username: username.toLowerCase(),
          }),
        },
      });
      if (user) {
        throw new BadRequestException('Username already taken');
      }
      return { message: 'Username is available' };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async getAuthenticatedUser(user: User) {
    try {
      const authenticatedUser = await this.userRepository.findOne({
        where: { id: user.id },
        select: [
          'id',
          'email',
          'username',
          'firstName',
          'avatar',
          'address',
          'city',
          'lastName',
          'isActive',
          'balance',
          'emailVerified',
          'isOnboardingCompleted',
        ],
      });

      return authenticatedUser.toDto();
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async changePassword(
    { oldPassword, newPassword }: ChangePasswordDto,
    user: User,
  ) {
    try {
      user = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatch = await PasswordEncoder.compare(
        oldPassword,
        user.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('Invalid old password');
      }

      const hashedPassword = await PasswordEncoder.hash(newPassword);

      await this.userRepository.findOneAndUpdate(
        { id: user.id },
        { password: hashedPassword },
      );

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async getProfile(user: User) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
        select: [
          'id',
          'email',
          'username',
          'phoneNumber',
          'address',
          'city',
          'firstName',
          'avatar',
          'lastName',
          'isActive',
          'balance',
          'emailVerified',
          'isPhoneNumberVerified',
          'isOnboardingCompleted',
        ],
      });

      const now = new Date();
      const currentMonthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
      );
      const nextMonthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0),
      );
      const previousMonthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0),
      );

      const [
        soldItemsCount,
        boughtItemsCount,
        soldThisMonthCount,
        soldPreviousMonthCount,
      ] = await Promise.all([
        this.yadsaleItemRepository.count({
          where: {
            offerItems: {
              buyerApprovalStatus: BuyerApprovalStatus.ACCEPTED,
              offer: {
                seller: { id: user.id },
              },
            },
          },
        }),
        this.yadsaleItemRepository.count({
          where: {
            offerItems: {
              buyerApprovalStatus: BuyerApprovalStatus.ACCEPTED,
              offer: {
                buyer: { id: user.id },
              },
            },
          },
        }),
        this.yadsaleItemRepository.count({
          where: {
            offerItems: {
              buyerApprovalStatus: BuyerApprovalStatus.ACCEPTED,
              offer: {
                seller: { id: user.id },
                updatedAt: Between(currentMonthStart, nextMonthStart),
              },
            },
          },
        }),
        this.yadsaleItemRepository.count({
          where: {
            offerItems: {
              buyerApprovalStatus: BuyerApprovalStatus.ACCEPTED,
              offer: {
                seller: { id: user.id },
                updatedAt: Between(previousMonthStart, currentMonthStart),
              },
            },
          },
        }),
      ]);

      const soldItemsMonthlyPercent =
        soldPreviousMonthCount === 0
          ? soldThisMonthCount > 0
            ? 100
            : 0
          : Math.round(
              ((soldThisMonthCount - soldPreviousMonthCount) /
                soldPreviousMonthCount) *
                100,
            );

      return {
        ...userData.toDto(),
        soldItemsCount,
        boughtItemsCount,
        soldItemsMonthlyPercent,
      };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async getUserOffers(data: PaginatedQuery, user: User) {
    try {
      return await this.yadsaleItemOfferRepository.findPaginated(data, {
        where: { buyer: { id: user.id } },
      });
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  async updateUser(
    data: UpdateUserDto,
    { completeProfile }: UpdateUserQueryDto,
    user: User,
  ) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (data.email && completeProfile === 'true' && !existingUser.email) {
        const existingEmailUser = await this.userRepository.findOne({
          where: { email: data.email },
        });

        if (existingEmailUser) {
          throw new BadRequestException('Email already in use');
        }
      }

      const updatedUser = await this.userRepository.findOneAndUpdate(
        { id: user.id },
        data,
        true,
      );

      if (!existingUser.email && completeProfile === 'true' && data.email) {
        console.log('Sending account creation email...');
        this.emailService.sendAccountCreationEmail({
          email: data.email,
          user: updatedUser,
        });
      }

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        address: updatedUser.address,
        city: updatedUser.city,
        avatar: updatedUser.toDto().avatar,
        originalAvatar: updatedUser.toDto().originalAvatar,
        isOnboardingCompleted: updatedUser.isOnboardingCompleted,
      };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  getAvatars() {
    const avatars = Config.AVATAR_URLS;

    return avatars.map((avatar) => {
      return getMediaUrl(avatar);
    });
  }

  async updateAvatar(
    { url }: UpdateAvatarDto,
    file: Express.Multer.File | undefined,
    user: User,
  ): Promise<Partial<User>> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (url) {
        existingUser.avatar = url;
        await this.userRepository.save(existingUser);
        return existingUser.toDto();
      }

      if (file) {
        validateFile({
          files: [file],
          supportedFormats: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
          ],
          maxFileSize: 5 * 1024 * 1024,
        });

        const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const { originalKey, webpKey } =
          await this.fileUploadService.uploadImageWithWebp(
            file,
            'avatars/',
            baseName,
          );
        existingUser.avatar = webpKey;
        existingUser.originalAvatar = originalKey;
        await this.userRepository.save(existingUser);

        if (!Config.AVATAR_URLS.includes(user.avatar)) {
          this.fileUploadService.deleteImageAndWebp(user.avatar);
        }

        return existingUser.toDto();
      }
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  @OnEvent(Events.ITEM_ALREADY_SOLD)
  async handleItemAlreadySoldEvent({ offer }: { offer: YadsaleItemOffer }) {
    this.logger.log(`Handling ITEM_ALREADY_SOLD event for offer ${offer.id}`);

    this.logger.log(
      `Refunding buyer ${offer.buyer.id} for offer ${offer.id} amount ${offer.price}`,
    );
    try {
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({ balance: () => `balance + ${offer.price}` })
        .where('id = :id', { id: offer.buyer.id })
        .execute();
    } catch (error) {
      handleErrorCatch(error);
    }
  }
}
