import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { ReportStatus } from '../entities/report.entity';

export class ReviewReportDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @IsOptional()
  @IsString()
  note?: string;
}