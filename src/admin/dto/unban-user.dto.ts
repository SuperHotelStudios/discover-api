import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UnbanUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
