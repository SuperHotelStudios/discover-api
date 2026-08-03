import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ParseArrayPipe } from '@nestjs/common';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  create(
    @Body()
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(
      createCategoryDto,
    );
  }

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

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(
      +id,
    );
  }
}