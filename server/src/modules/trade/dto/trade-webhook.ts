import { IsNumber, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { TokenTypeEnum } from 'src/libs/common/constants/constants';
import { ApiProperty } from '@nestjs/swagger';

export class TradeWebhookDto {
  @ApiProperty({ example: '6b0ce881-fb48-43bf-ac1d-628565534818' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  volume: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  fees: number;

  @ApiProperty({ example: TokenTypeEnum.USDT, enum: TokenTypeEnum })
  @IsEnum(TokenTypeEnum)
  @IsNotEmpty()
  tokenType: TokenTypeEnum;
}
