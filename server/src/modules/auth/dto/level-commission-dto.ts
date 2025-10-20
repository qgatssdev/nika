import { IsNumber, IsOptional } from 'class-validator';

export class LevelCommissionsDto {
  @IsOptional()
  @IsNumber()
  level1?: number;

  @IsOptional()
  @IsNumber()
  level2?: number;

  @IsOptional()
  @IsNumber()
  level3?: number;
}
