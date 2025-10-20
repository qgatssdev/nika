import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Config } from 'src/config';
import { PasswordEncoder } from 'src/infra/password-encoder/password-encoder';
import { handleErrorCatch } from 'src/libs/common/helpers/utils';
import { LoginRequestDto } from '../dto/login-request.dto';
import { SignUpDto } from '../dto/signup.dto';
import { User } from '../entity/user.entity';
import { UserRepository } from '../repository/user.repository';
import { ReferralService } from 'src/modules/referral/services/referral.service';
import { UserWalletRepository } from '../repository/user-wallet-repository';
import { TokenTypeEnum } from 'src/libs/common/constants/constants';
@Injectable()
export class AuthService {
  private logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly userRepository: UserRepository;

  @Inject()
  private readonly referralService: ReferralService;

  @Inject()
  private readonly userWalletRepository: UserWalletRepository;

  public async signUp({
    email,
    password,
    firstName,
    lastName,
    referralCode,
  }: SignUpDto) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email },
      });

      if (userExists) throw new BadRequestException('User already exists');

      if (referralCode) {
        const isValid =
          await this.referralService.validateReferralCode(referralCode);
        if (!isValid) throw new BadRequestException('Invalid referral code');
      }

      const hashedPassword = await PasswordEncoder.hash(password);
      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      await this.userRepository.save(newUser);

      const defaultWallets = [
        TokenTypeEnum.USDT,
        TokenTypeEnum.ETH,
        TokenTypeEnum.SOL,
        TokenTypeEnum.BTC,
      ].map((tokenType) => ({
        user: { id: newUser.id },
        tokenType,
        balance: 0,
        claimedAmount: 0,
      }));

      await this.userWalletRepository.saveMany(defaultWallets);

      if (referralCode) {
        await this.referralService.registerReferral(referralCode, newUser.id);
      }

      const { referralCode: generatedCode } =
        await this.referralService.generateReferralCode(newUser.id);

      const token = this.signToken(newUser);
      return {
        message: 'User created successfully',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          referralCode: generatedCode,
        },
      };
    } catch (error) {
      handleErrorCatch(error);
    }
  }

  private signToken(user: User) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      Config.JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );
  }

  async login({ email, password }: LoginRequestDto) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.email) = LOWER(:email)', { email })
        .getOne();

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const passwordMatch = await PasswordEncoder.compare(
        password,
        user.password,
      );

      if (!passwordMatch) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.signToken(user);
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      handleErrorCatch(error);
    }
  }
}
