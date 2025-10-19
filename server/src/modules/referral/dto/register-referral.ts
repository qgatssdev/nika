import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RegisterReferralDto {
  @IsString()
  @IsNotEmpty()
  referralCode: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
