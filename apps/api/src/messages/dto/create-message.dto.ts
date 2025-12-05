import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  attachments?: any;

  @IsOptional()
  embeds?: any;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
