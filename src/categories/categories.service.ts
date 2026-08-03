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
  ) { }

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

  async createBulk(
    createCategoryDtos: CreateCategoryDto[],
  ) {

    const created: Category[] = [];

    for (const dto of createCategoryDtos) {
      const exists =
        await this.categoryRepository.findOne({
          where: {
            name: dto.name.trim(),
          },
        });

      if (exists) {
        continue;
      }

      const category =
        this.categoryRepository.create({
          name: dto.name.trim(),
          icon: dto.icon.trim(),
        });

      created.push(
        await this.categoryRepository.save(
          category,
        ),
      );
    }

    return {
      message: `${created.length} categories created successfully.`,
      categories: created,
    };
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id);

    return {
      message: 'Category deleted.',
    };
  }
}