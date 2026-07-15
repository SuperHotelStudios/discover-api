import {
  IsString,
} from 'class-validator';

export class CreateAdvertisementDto {
  @IsString()
  inviteLink!: string;

  @IsString()
  description!: string;

  @IsString()
  banner!: string;

  @IsString()
  category!: string;
}