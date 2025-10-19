import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { Referral } from '../entity/referral.entity';

export class ReferralRepository extends BaseRepository<Referral> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(Referral));
  }
}
