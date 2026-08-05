import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryRequest } from './entities/category-request.entity';

import { CategoryRequestsController } from './category-requests.controller';
import { CategoryRequestsService } from './category-requests.service';
import { Category } from '../categories/entities/category.entity';
import { AdminGuard } from '../admin/guards/admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryRequest,
       Category,
    ]),
  ],
  controllers: [
    CategoryRequestsController,
  ],
  providers: [
    CategoryRequestsService,
    AdminGuard,
  ],
  exports: [
    CategoryRequestsService,
  ],
})
export class CategoryRequestsModule {}
