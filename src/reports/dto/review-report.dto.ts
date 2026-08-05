import {
  IsOptional,
  IsString,
} from 'class-validator';

export class ReviewReportDto {
  @IsOptional()
  @IsString()
  note?: string;
}
