import { IsNumber, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class TradeWebhookDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  volume: number;

  @IsNumber()
  @IsNotEmpty()
  fees: number;
}
