import { IsString, IsOptional, IsEnum, IsInt, MaxLength } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  topic?: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;

  @IsOptional()
  @IsInt()
  position?: number;
}
