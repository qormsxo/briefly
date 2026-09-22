import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class UpdateUserThemesDto {
  @ApiProperty({ example: ['politics', 'economy', 'sports'] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  themeIds: string[];
}
