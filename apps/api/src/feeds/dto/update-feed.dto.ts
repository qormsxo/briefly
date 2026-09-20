import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateFeedDto {
  @ApiPropertyOptional({ example: 'https://hnrss.org/best' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;
}
