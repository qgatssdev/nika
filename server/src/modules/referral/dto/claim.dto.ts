import { IsEnum, IsNotEmpty } from 'class-validator';
import { TokenTypeEnum } from 'src/libs/common/constants/constants';

export class ClaimDto {
  @IsEnum(TokenTypeEnum)
  @IsNotEmpty()
  tokenType: TokenTypeEnum;
}
