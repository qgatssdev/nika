import {
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { LevelCommissionsDto } from './level-commission-dto';
import { Type } from 'class-transformer';

export class UpdateCustomStructureDto {
  @IsOptional()
  @IsBoolean()
  isKOL?: boolean;

  @IsOptional()
  @IsNumber()
  directCommission?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LevelCommissionsDto)
  levelCommissions?: LevelCommissionsDto;

  @IsOptional()
  @IsBoolean()
  waivedFees?: boolean;
}
