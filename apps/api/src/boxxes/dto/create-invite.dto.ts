import { IsOptional, IsInt, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInviteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
