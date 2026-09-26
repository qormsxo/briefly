import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class UpdateUserKeywordsDto {
  @ApiProperty({ example: ['금리', '반도체'] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  include: string[];

  @ApiProperty({ example: ['부고', '운세'] })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  exclude: string[];
}
