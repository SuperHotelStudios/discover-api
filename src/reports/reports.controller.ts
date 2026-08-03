import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ReportsService } from './reports.service';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';

import { ReportStatus } from './entities/report.entity';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    dto: CreateReportDto,

    @Request()
    req,
  ) {
    return this.reportsService.create(
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myReports(
    @Request()
    req,
  ) {
    return this.reportsService.findMyReports(
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('status')
    status?: ReportStatus,
  ) {
    return this.reportsService.findAll(
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: ReviewReportDto,

    @Request()
    req,
  ) {
    return this.reportsService.resolve(
      id,
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: ReviewReportDto,

    @Request()
    req,
  ) {
    return this.reportsService.reject(
      id,
      dto,
      req.user,
    );
  }
}