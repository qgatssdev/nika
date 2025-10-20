import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TokenTypeEnum } from 'src/libs/common/constants/constants';

export class ClaimDto {
  @ApiProperty({ example: TokenTypeEnum.USDT, enum: TokenTypeEnum })
  @IsEnum(TokenTypeEnum)
  @IsNotEmpty()
  tokenType: TokenTypeEnum;
}
