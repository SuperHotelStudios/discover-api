import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CategoryRequest,
  CategoryRequestStatus,
} from './entities/category-request.entity';

import { CreateCategoryRequestDto } from './dto/create-category-request.dto';
import { Category } from '../categories/entities/category.entity';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoryRequestsService {
  constructor(
    @InjectRepository(CategoryRequest)
    private readonly categoryRequestRepository: Repository<CategoryRequest>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    dto: CreateCategoryRequestDto,
    user: any,
  ) {
    const existing =
      await this.categoryRequestRepository.findOne({
        where: {
          name: dto.name.trim(),
          status: CategoryRequestStatus.PENDING,
        },
      });

    if (existing) {
      throw new ConflictException(
        'This category has already been requested.',
      );
    }

    const request =
      this.categoryRequestRepository.create({
        name: dto.name.trim(),
        icon: dto.icon.trim(),
        requestedBy: user,
      });

    await this.categoryRequestRepository.save(
      request,
    );

    return {
      message:
        'Category request submitted successfully.',
    };
  }

  async findPending() {
    return this.categoryRequestRepository.find({
      where: {
        status:
          CategoryRequestStatus.PENDING,
      },
      relations: ['requestedBy'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async approve(
  id: number,
  admin: User,
) {
  const request =
    await this.categoryRequestRepository.findOne({
      where: { id },
    });

  if (!request) {
    throw new NotFoundException(
      'Category request not found.',
    );
  }

  if (
    request.status !==
    CategoryRequestStatus.PENDING
  ) {
    throw new BadRequestException(
      'Request has already been reviewed.',
    );
  }

  const existingCategory =
    await this.categoryRepository.findOne({
      where: {
        name: request.name,
      },
    });

  if (existingCategory) {
    throw new ConflictException(
      'Category already exists.',
    );
  }

  const category =
    this.categoryRepository.create({
      name: request.name,
      icon: request.icon,
    });

  await this.categoryRepository.save(category);

  request.status =
    CategoryRequestStatus.APPROVED;

  request.reviewedBy = admin;

  request.reviewedAt = new Date();

  await this.categoryRequestRepository.save(
    request,
  );

  return {
    message:
      'Category request approved successfully.',
  };
  }

  async reject(
  id: number,
  reason: string,
  admin: User,
) {
  const request =
    await this.categoryRequestRepository.findOne({
      where: { id },
    });

  if (!request) {
    throw new NotFoundException(
      'Category request not found.',
    );
  }

  if (
    request.status !==
    CategoryRequestStatus.PENDING
  ) {
    throw new BadRequestException(
      'Request has already been reviewed.',
    );
  }

  request.status =
    CategoryRequestStatus.REJECTED;

  request.reviewedBy = admin;

  request.reviewedAt = new Date();

  request.rejectionReason = reason;

  await this.categoryRequestRepository.save(
    request,
  );

  return {
    message:
      'Category request rejected.',
  };
  }

  async findMyRequests(user: User) {
  return this.categoryRequestRepository.find({
    where: {
      requestedBy: {
        id: user.id,
      },
    },
    relations: [
      'reviewedBy',
    ],
    order: {
      createdAt: 'DESC',
    },
  });
  }
}