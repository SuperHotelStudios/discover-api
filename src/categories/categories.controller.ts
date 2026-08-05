import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ParseArrayPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(
    @Body()
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(
      createCategoryDto,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('bulk')
  createBulk(
    @Body(
      new ParseArrayPipe({
        items: CreateCategoryDto,
      }),
    )
    createCategoryDtos: CreateCategoryDto[],
  ) {
    return this.categoriesService.createBulk(
      createCategoryDtos,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(
      +id,
    );
  }
}
