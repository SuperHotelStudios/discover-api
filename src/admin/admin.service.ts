import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { Category } from '../categories/entities/category.entity';
import { Review } from '../reviews/entities/review.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Report } from '../reports/entities/report.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(CommunityView)
    private readonly viewRepository: Repository<CommunityView>,

    @InjectRepository(InviteClick)
    private readonly clickRepository: Repository<InviteClick>,

    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    
  ) {}

  async getDashboard() {
    const users =
      await this.userRepository.count();

    const communities =
      await this.communityRepository.count();

    const advertisements =
      await this.advertisementRepository.count();

    const featured =
      await this.communityRepository.count({
        where: {
          featured: true,
        },
      });

    const verified =
      await this.communityRepository.count({
        where: {
          verified: true,
        },
      });

    const categories =
      await this.categoryRepository.count();

    const reviews =
      await this.reviewRepository.count();

    const favorites =
      await this.favoriteRepository.count();

    const views =
      await this.viewRepository.count();

    const clicks =
      await this.clickRepository.count();

    return {
      statistics: {
        users,
        communities,
        advertisements,
        featured,
        verified,
        categories,
        reviews,
        favorites,
        views,
        clicks,
      },
    };
  }

  async getCommunities() {
  return this.communityRepository.find({
    relations: ['createdBy'],
    order: {
      createdAt: 'DESC',
    },
  });
  }

  async verifyCommunity(id: number) {
  const community =
    await this.communityRepository.findOne({
      where: { id },
    });

  if (!community) {
    throw new NotFoundException(
      'Community not found.',
    );
  }

  community.verified =
    !community.verified;

  await this.communityRepository.save(
    community,
  );

  return {
    message: community.verified
      ? 'Community verified.'
      : 'Community unverified.',
  };
}

  async featureCommunity(id: number) {
    const community =
      await this.communityRepository.findOne({
        where: { id },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    community.featured =
      !community.featured;

    await this.communityRepository.save(
      community,
    );

    return {
      message: community.featured
        ? 'Community featured.'
        : 'Community removed from featured.',
    };
  }

  async toggleHidden(id: number) {
    const community =
      await this.communityRepository.findOne({
        where: { id },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    community.hidden =
      !community.hidden;

    if (community.hidden) {
      community.hiddenReason =
        'Hidden by administrator.';
    } else {
      community.hiddenReason = undefined;
    }

    await this.communityRepository.save(
      community,
    );

    return {
      message: community.hidden
        ? 'Community hidden.'
        : 'Community restored.',
    };
    
  }
async deleteCommunity(
  id: number,
  reason: string,
) {
  console.log('\n========== DELETE COMMUNITY ==========');
  console.log('Community ID:', id);
  console.log('Reason:', reason);

  const community =
    await this.communityRepository.findOne({
      where: { id },
    });

  console.log('Community Found:', community);

  if (!community) {
    console.log('Community does not exist.');
    throw new NotFoundException(
      'Community not found.',
    );
  }

  console.log('Community exists. Starting deletion...');

  // Delete reports
  await this.reportRepository
    .createQueryBuilder()
    .delete()
    .from(Report)
    .where('communityId = :id', { id })
    .execute();

  // Delete reviews
  await this.reviewRepository
    .createQueryBuilder()
    .delete()
    .from(Review)
    .where('communityId = :id', { id })
    .execute();

  // Delete favorites
  await this.favoriteRepository
    .createQueryBuilder()
    .delete()
    .from(Favorite)
    .where('communityId = :id', { id })
    .execute();

  // Delete views
  const qb = this.viewRepository
    .createQueryBuilder()
    .delete()
    .from(CommunityView)
    .where("communityId = :id", { id });

  console.log(qb.getSql());

  const result = await qb.execute();

  console.log(result);

  // Delete invite clicks
  await this.clickRepository
    .createQueryBuilder()
    .delete()
    .from(InviteClick)
    .where('communityId = :id', { id })
    .execute();

  // Delete advertisements
  await this.advertisementRepository
    .createQueryBuilder()
    .delete()
    .from(Advertisement)
    .where('communityId = :id', { id })
    .execute();

  // Finally delete the community
  await this.communityRepository.delete(id);

  return {
    message: 'Community deleted successfully.',
    reason,
  };
}
}