import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReferralDto {
  @ApiProperty({ example: '6b0ce881-fb48-43bf-ac1d-628565534818' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
