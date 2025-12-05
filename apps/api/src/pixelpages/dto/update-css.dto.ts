import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCssDto {
  @IsString()
  @IsNotEmpty()
  customCss: string;
}
