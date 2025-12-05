// @ts-nocheck
import { IsObject, IsInt, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { SectionType } from '@prisma/client';

export class UpdateSectionDto {
  @IsOptional()
  @IsEnum(SectionType)
  type?: SectionType;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
