import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from 'src/libs/core/base/base.repository';
import { Commission } from '../entity/commission.entity';

export class CommissionRepository extends BaseRepository<Commission> {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(entityManager.getRepository(Commission));
  }
}
