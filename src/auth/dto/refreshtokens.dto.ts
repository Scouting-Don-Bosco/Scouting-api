import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokensDto {
  @ApiProperty()
  refreshToken: string;
}
