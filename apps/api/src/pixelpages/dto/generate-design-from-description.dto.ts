import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { DesignPreferencesDto } from './generate-design-from-image.dto';

export class GenerateDesignFromDescriptionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsObject()
  preferences?: DesignPreferencesDto;
}
