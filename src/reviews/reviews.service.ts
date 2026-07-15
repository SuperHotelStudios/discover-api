import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    user: any,
  ) {
    // STEP 1 : Find logged-in user
    const reviewer = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    if (!reviewer) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    // STEP 2 : Find community
    const community =
      await this.communityRepository.findOne({
        where: {
          id: createReviewDto.communityId,
        },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    // STEP 3 : Check duplicate review
    const existingReview =
      await this.reviewRepository.findOne({
        where: {
          reviewer: {
            id: reviewer.id,
          },
          community: {
            id: community.id,
          },
        },
        relations: [
          'reviewer',
          'community',
        ],
      });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this community.',
      );
    }

    // STEP 4 : Save review
    const review =
      this.reviewRepository.create({
        reviewer,
        community,
        rating: createReviewDto.rating,
        comment:
          createReviewDto.comment ?? '',
      });

    await this.reviewRepository.save(
      review,
    );

    // STEP 5 : Recalculate ratings
    const reviews =
      await this.reviewRepository.find({
        where: {
          community: {
            id: community.id,
          },
        },
      });

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );

    community.totalReviews =
      reviews.length;

    community.averageRating =
      totalRating / reviews.length;

    await this.communityRepository.save(
      community,
    );

    return {
      message:
        'Review submitted successfully!',
    };
  }

  async findByCommunity(
    communityId: number,
  ) {
    return this.reviewRepository.find({
      where: {
        community: {
          id: communityId,
        },
      },
      relations: ['reviewer'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}