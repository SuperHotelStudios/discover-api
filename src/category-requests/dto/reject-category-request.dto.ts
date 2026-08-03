import {
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class RejectCategoryRequestDto {
  @IsNotEmpty()
  @MaxLength(255)
  reason!: string;
}