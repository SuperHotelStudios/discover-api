import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
import { Community } from '../communities/entities/community.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Review } from '../reviews/entities/review.entity';
import { Between } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(CommunityView)
    private readonly viewRepository: Repository<CommunityView>,

    @InjectRepository(InviteClick)
    private readonly clickRepository: Repository<InviteClick>,

    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getDashboard(user: any) {
    const communities =
      await this.communityRepository.find({
        where: {
          createdBy: {
            id: user.id,
          },
        },
      });

    let totalViews = 0;
    let totalClicks = 0;
    let totalFavorites = 0;
    let totalReviews = 0;
    let totalPoints = 0;
    let totalRating = 0;

    for (const community of communities) {
      totalViews += await this.viewRepository.count({
        where: {
          community: {
            id: community.id,
          },
        },
      });

      totalClicks += await this.clickRepository.count({
        where: {
          community: {
            id: community.id,
          },
        },
      });

      totalFavorites += await this.favoriteRepository.count({
        where: {
          community: {
            id: community.id,
          },
        },
      });

      totalReviews += community.totalReviews;
      totalPoints += community.totalPoints;
      totalRating += community.averageRating;
    }

    const averageRating =
      communities.length === 0
        ? 0
        : totalRating / communities.length;

    const topCommunities = [...communities]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5);

const communityIds = communities.map(
  (community) => community.id,
);

let latestReviews: Review[] = [];

if (communityIds.length > 0) {
  latestReviews =
    await this.reviewRepository.find({
      where: {
        community: {
          id: In(communityIds),
        },
      },
      relations: [
        'reviewer',
        'community',
      ],
      order: {
        createdAt: 'DESC',
      },
      take: 5,
    });
}

const today = new Date();

const thirtyDaysAgo = new Date();

thirtyDaysAgo.setDate(today.getDate() - 29);

const viewsChart: { day: string; value: number }[] = [];

const clicksChart: { day: string; value: number }[] = [];

for (let i = 0; i < 30; i++) {

  const start = new Date(thirtyDaysAgo);

  start.setDate(thirtyDaysAgo.getDate() + i);

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setHours(23, 59, 59, 999);

  const views = await this.viewRepository.count({

    where: {

      community: {

        id: In(communityIds),

      },

      viewedAt: Between(start, end),

    },

  });

  const clicks = await this.clickRepository.count({

    where: {

      community: {

        id: In(communityIds),

      },

      clickedAt: Between(start, end),

    },

  });

  viewsChart.push({

    day: start.toLocaleDateString('en-IN', {

      day: 'numeric',

      month: 'short',

    }),

    value: views,

  });

  clicksChart.push({

    day: start.toLocaleDateString('en-IN', {

      day: 'numeric',

      month: 'short',

    }),

    value: clicks,

  });

}


    return {
      statistics: {
        communities: communities.length,
        views: totalViews,
        clicks: totalClicks,
        favorites: totalFavorites,
        reviews: totalReviews,
        rating: averageRating,
        points: totalPoints,
      },

      topCommunities,

      latestReviews,

      viewsChart,

      clicksChart
    };
  }
}
