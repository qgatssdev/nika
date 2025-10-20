import { IsNumber, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { TokenTypeEnum } from 'src/libs/common/constants/constants';

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

  @IsEnum(TokenTypeEnum)
  @IsNotEmpty()
  tokenType: TokenTypeEnum;
}
