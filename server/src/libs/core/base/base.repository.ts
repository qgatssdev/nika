import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  Repository,
  FindOneOptions,
  SaveOptions,
} from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseRepository<T extends BaseEntity> {
  private entity: Repository<T>;
  protected constructor(entry: Repository<T>) {
    this.entity = entry;
  }

  async save(
    data: DeepPartial<T>,
    options?: SaveOptions & {
      reload: false;
    },
  ): Promise<T> {
    return (await this.entity.save(data, options)) as T;
  }

  async saveMany(
    data: DeepPartial<T>[],
    options?: SaveOptions & {
      reload: false;
    },
  ): Promise<T[]> {
    return (await this.entity.save(data, options)) as T[];
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    const entity = await this.entity.findOne(options);

    return entity as T;
  }

  async exists(options: FindOneOptions<T>): Promise<boolean> {
    return await this.entity.exists(options);
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
    returnEntity = true,
  ) {
    const updateResult = await this.entity.update(where, partialEntity);

    if (!updateResult.affected) {
      console.warn('Entity not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    if (returnEntity) {
      const filter = { ...where, ...partialEntity } as
        | FindOptionsWhere<T>
        | FindOptionsWhere<T>[];
      return await this.findOne({ where: filter });
    }
  }

  async updateAll(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ) {
    return await this.entity.update(where, partialEntity);
  }

  async delete(where: FindOptionsWhere<T>) {
    const res = await this.entity.delete(where);
    return {
      status: !!res.affected,
    };
  }

  createQueryBuilder(alias?: string) {
    return this.entity.createQueryBuilder(alias);
  }

  public create(data: DeepPartial<T>): T {
    return this.entity.create(data);
  }

  public async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.entity.find(options);
  }

  public async remove(data: T): Promise<T> {
    return await this.entity.remove(data);
  }

  async search(
    keyword: string,
    columns: string[],
    entityName: string,
    pageSize = 10,
    currentPage = 1,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    relations?: string[],
  ) {
    try {
      const queryBuilder = this.createQueryBuilder(entityName);

      const whereConditions = columns.map((column) => {
        if (column.includes('.')) {
          return `LOWER(${column}) LIKE :term`;
        }
        return `LOWER(${entityName}.${column}) LIKE :term`;
      });

      const offset = (currentPage - 1) * pageSize;

      queryBuilder.where(`(${whereConditions.join(' OR ')})`, {
        term: `%${keyword.toLowerCase()}%`,
      });

      // Normalize where: flatten any object value with an 'id' field into primitive id
      const normalize = (cond: any) => {
        if (!cond) return cond;
        const out: any = {};
        Object.entries(cond).forEach(([k, v]) => {
          if (
            v &&
            typeof v === 'object' &&
            !Array.isArray(v) &&
            !(v instanceof Date) &&
            Object.prototype.hasOwnProperty.call(v, 'id') &&
            (typeof (v as any).id === 'string' ||
              typeof (v as any).id === 'number')
          ) {
            out[k] = (v as any).id; // flatten relation object
          } else {
            out[k] = v as any;
          }
        });
        return out;
      };

      if (where) {
        if (Array.isArray(where)) {
          where.forEach((condition) => {
            const normalized = normalize(condition);
            queryBuilder.orWhere(
              `(${this.buildConditionString(normalized as FindOptionsWhere<T>, entityName)})`,
              { ...normalized },
            );
          });
        } else {
          const normalized = normalize(where);
          queryBuilder.andWhere(
            `(${this.buildConditionString(normalized as FindOptionsWhere<T>, entityName)})`,
            { ...normalized },
          );
        }
      }

      const [data, total] = await Promise.all([
        queryBuilder.take(pageSize).skip(offset).getMany(),
        queryBuilder.getCount(),
      ]);

      return {
        data,
        pagination: {
          total,
          size: pageSize,
          page: currentPage,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  buildConditionString(
    condition: FindOptionsWhere<T>,
    entityName?: string,
  ): string {
    let conditions = Object.keys(condition).map((key) => `${key} = :${key}`);
    if (entityName) {
      conditions = Object.keys(condition).map(
        (key) => `${entityName}.${key} = :${key}`,
      );
    }
    return conditions.join(' AND ');
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    try {
      return await this.entity.count(options);
    } catch (error) {
      console.error('Error counting entities:', error);
      throw error;
    }
  }

  async increment(
    where: FindOptionsWhere<T>,
    propertyPath: keyof T,
    value: number,
  ): Promise<void> {
    await this.entity.increment(where, propertyPath as string, value);
  }

  async decrement(
    where: FindOptionsWhere<T>,
    propertyPath: keyof T,
    value: number,
  ): Promise<void> {
    await this.entity.decrement(where, propertyPath as string, value);
  }
}
