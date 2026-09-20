import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateFeedDto {
  @ApiProperty({ example: 'https://hnrss.org/newest' })
  @IsUrl({ require_protocol: true })
  url: string;
}
