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

@Injectable()
export class AuthService {
  private logger: Logger;
  constructor() {
    this.logger = new Logger();
  }

  @Inject()
  private readonly userRepository: UserRepository;

  public async signUp({ email, password, firstName, lastName }: SignUpDto) {
    try {
      const userExists = await this.userRepository.findOne({
        where: { email },
      });
      if (userExists) {
        throw new BadRequestException('User already exists');
      }
      const hashedPassword = await PasswordEncoder.hash(password);

      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      await this.userRepository.save(user);

      return {
        message: 'User created successfully',
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
