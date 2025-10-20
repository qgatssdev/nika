import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LevelCommissionsDto {
  @ApiPropertyOptional({ example: 0.3 })
  @IsOptional()
  @IsNumber()
  level1?: number;

  @ApiPropertyOptional({ example: 0.03 })
  @IsOptional()
  @IsNumber()
  level2?: number;

  @ApiPropertyOptional({ example: 0.02 })
  @IsOptional()
  @IsNumber()
  level3?: number;
}
