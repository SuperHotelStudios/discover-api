import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async create(
    createCategoryDto: CreateCategoryDto,
  ) {
    const exists =
      await this.categoryRepository.findOne({
        where: {
          name: createCategoryDto.name,
        },
      });

    if (exists) {
      throw new ConflictException(
        'Category already exists.',
      );
    }

    const category =
      this.categoryRepository.create(
        createCategoryDto,
      );

    return this.categoryRepository.save(
      category,
    );
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id);

    return {
      message: 'Category deleted.',
    };
  }
}