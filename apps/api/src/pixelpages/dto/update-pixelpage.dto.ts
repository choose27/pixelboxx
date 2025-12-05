import { IsString, IsBoolean, IsOptional, IsUrl, IsObject } from 'class-validator';

export class UpdatePixelPageDto {
  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsObject()
  layoutJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  musicUrl?: string;

  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
