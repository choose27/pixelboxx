import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGuestbookEntryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
