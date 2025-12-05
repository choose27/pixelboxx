import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  css?: string;

  @IsOptional()
  @IsUrl()
  previewUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
