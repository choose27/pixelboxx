import { IsOptional, IsBoolean, IsIn, IsObject } from 'class-validator';

export class DesignPreferencesDto {
  @IsOptional()
  @IsBoolean()
  dark_mode?: boolean;

  @IsOptional()
  @IsIn(['none', 'low', 'medium', 'high'])
  animation_level?: 'none' | 'low' | 'medium' | 'high';

  @IsOptional()
  @IsBoolean()
  high_contrast?: boolean;

  @IsOptional()
  @IsIn(['minimal', 'normal', 'heavy'])
  pixel_density?: 'minimal' | 'normal' | 'heavy';

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  neon_intensity?: 'low' | 'medium' | 'high';
}

export class GenerateDesignFromImageDto {
  @IsOptional()
  @IsObject()
  preferences?: DesignPreferencesDto;
}
