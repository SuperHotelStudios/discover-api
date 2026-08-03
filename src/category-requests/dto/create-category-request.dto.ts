import {
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateCategoryRequestDto {
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;

  @IsNotEmpty()
  @MaxLength(10)
  icon!: string;
}