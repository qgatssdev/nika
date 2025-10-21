import {
  IsNumber,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TokenTypeEnum } from 'src/libs/common/constants/constants';
import { ApiProperty } from '@nestjs/swagger';

export class TradeWebhookDto {
  @ApiProperty({ example: '6b0ce881-fb48-43bf-ac1d-628565534818' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  volume: number;

  @ApiProperty({ example: 3.2, required: false })
  @IsOptional()
  @IsNumber()
  fees?: number;

  @ApiProperty({ example: TokenTypeEnum.ETH, enum: TokenTypeEnum })
  @IsEnum(TokenTypeEnum)
  @IsNotEmpty()
  payTokenType: TokenTypeEnum;

  @ApiProperty({ example: TokenTypeEnum.USDC, enum: TokenTypeEnum })
  @IsEnum(TokenTypeEnum)
  @IsNotEmpty()
  getTokenType: TokenTypeEnum;
}
