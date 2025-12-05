import { IsString, IsNotEmpty, IsObject, IsInt, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { SectionType } from '@prisma/client';

export class CreateSectionDto {
  @IsEnum(SectionType)
  @IsNotEmpty()
  type: SectionType;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
