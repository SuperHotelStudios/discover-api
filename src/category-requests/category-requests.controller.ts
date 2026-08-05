import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

import { CategoryRequestsService } from './category-requests.service';

import { CreateCategoryRequestDto } from './dto/create-category-request.dto';

import {
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { RejectCategoryRequestDto } from './dto/reject-category-request.dto';

@Controller('category-requests')
export class CategoryRequestsController {
  constructor(
    private readonly categoryRequestsService: CategoryRequestsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    dto: CreateCategoryRequestDto,

    @Request()
    req,
  ) {
    return this.categoryRequestsService.create(
      dto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe)
    id: number,

    @Request()
    req,
  ) {
    return this.categoryRequestsService.approve(
      id,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/reject')
  reject(
  @Param('id', ParseIntPipe)
  id: number,

  @Body()
  dto: RejectCategoryRequestDto,

  @Request()
  req,
) {
  return this.categoryRequestsService.reject(
    id,
    dto.reason,
    req.user,
  );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('pending')
  pending() {
    return this.categoryRequestsService.findPending();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myRequests(
    @Request()
    req,
  ) {
    return this.categoryRequestsService.findMyRequests(
      req.user,
    );
  }
}
