import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  css: string;

  @IsOptional()
  @IsUrl()
  previewUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
