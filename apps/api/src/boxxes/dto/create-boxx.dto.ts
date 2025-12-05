import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateBoxxDto {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
