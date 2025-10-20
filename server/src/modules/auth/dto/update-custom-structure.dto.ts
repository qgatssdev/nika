import {
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { LevelCommissionsDto } from './level-commission-dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomStructureDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isKOL?: boolean;

  @ApiPropertyOptional({ example: 0.15 })
  @IsOptional()
  @IsNumber()
  directCommission?: number;

  @ApiPropertyOptional({
    example: { level1: 0.3, level2: 0.03, level3: 0.02 },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LevelCommissionsDto)
  levelCommissions?: LevelCommissionsDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  waivedFees?: boolean;
}
