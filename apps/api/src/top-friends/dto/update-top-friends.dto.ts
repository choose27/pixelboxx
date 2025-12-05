import { IsArray, IsString, IsInt, Min, Max, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class TopFriendPosition {
  @IsString()
  friendId: string;

  @IsInt()
  @Min(1)
  @Max(8)
  position: number;
}

export class UpdateTopFriendsDto {
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(8)
  topFriends: TopFriendPosition[];
}
