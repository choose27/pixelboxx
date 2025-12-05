import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailDigest?: boolean;

  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  friendRequests?: boolean;

  @IsBoolean()
  @IsOptional()
  guestbookEntries?: boolean;

  @IsBoolean()
  @IsOptional()
  mentions?: boolean;

  @IsBoolean()
  @IsOptional()
  boxxInvites?: boolean;
}
