import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Community } from './entities/community.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { Review } from '../reviews/entities/review.entity';

import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(CommunityView)
    private readonly viewRepository: Repository<CommunityView>,

    @InjectRepository(InviteClick)
    private readonly clickRepository: Repository<InviteClick>,

    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  create(createCommunityDto: CreateCommunityDto, owner: any) {
    const community = this.communityRepository.create({
      ...createCommunityDto,
      owner,
    });

    return this.communityRepository.save(community);
  }

  findAll() {
    return this.communityRepository.find({
      relations: ['owner'],
    });
  }

  findOne(id: number) {
    return this.communityRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async update(
    id: number,
    updateCommunityDto: UpdateCommunityDto,
    user: any,
  ) {
    const community =
      await this.communityRepository.findOne({
        where: { id },
        relations: ['owner'],
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    if (community.owner.id !== user.id) {
      throw new ForbiddenException(
        'You do not own this community.',
      );
    }

    Object.assign(
      community,
      updateCommunityDto,
    );

    await this.communityRepository.save(
      community,
    );

    return community;
  }

  async deleteMyCommunity(
    id: number,
    user: any,
  ) {
    const community =
      await this.communityRepository.findOne({
        where: { id },
        relations: ['owner'],
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );

    }

    if (community.owner.id !== user.id) {
      throw new ForbiddenException(
        'You do not own this community.',
      );
    }

    // Delete all reviews
    await this.reviewRepository
      .createQueryBuilder()
      .delete()
      .from(Review)
      .where('communityId = :id', { id })
      .execute();

    // Delete all advertisements
    await this.advertisementRepository
      .createQueryBuilder()
      .delete()
      .from(Advertisement)
      .where('communityId = :id', { id })
      .execute();

    // Delete the community
    await this.communityRepository.remove(
      community,
    );

    return {
      message:
        'Community deleted successfully.',
    };
  }

  async findMyCommunities(user: any) {
    return this.communityRepository.find({
      where: {
        owner: {
          id: user.id,
        },
      },
      relations: ['owner'],
      order: {
        totalPoints: 'DESC',
      },
    });
  }

  async getLeaderboard() {
    const communities = await this.communityRepository.find({
      relations: ['owner'],
      order: {
        totalPoints: 'DESC',
      },
    });

    return Promise.all(
      communities.map(async (community) => {
        const views = await this.viewRepository.count({
          where: {
            community: { id: community.id },
          },
        });

        const clicks = await this.clickRepository.count({
          where: {
            community: { id: community.id },
          },
        });

        const favorites =
          await this.favoriteRepository.count({
            where: {
              community: { id: community.id },
            },
          });

        return {
          ...community,
          views,
          clicks,
          favorites,
        };
      }),
    );
  }
}