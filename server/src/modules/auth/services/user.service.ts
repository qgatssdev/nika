import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { handleErrorCatch } from 'src/libs/common/helpers/utils';
import { User } from '../entity/user.entity';

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
      });

      return authenticatedUser;
    } catch (error) {
      handleErrorCatch(error);
    }
  }
}
