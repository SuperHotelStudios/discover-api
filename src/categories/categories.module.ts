import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { AdminGuard } from '../admin/guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
    ]),
  ],
  controllers: [
    CategoriesController,
  ],
  providers: [
    CategoriesService,
    AdminGuard,
  ],
  exports: [
    CategoriesService,
  ],
})
export class CategoriesModule {}
