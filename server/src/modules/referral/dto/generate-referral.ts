import { IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateReferralDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
