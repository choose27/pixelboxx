import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  topic?: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;
}
