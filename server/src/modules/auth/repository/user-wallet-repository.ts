import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { UserWallet } from '../entity/user-wallet.entity';

export class UserWalletRepository extends BaseRepository<UserWallet> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(UserWallet));
  }
}
