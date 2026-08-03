import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class DeleteCommunityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}