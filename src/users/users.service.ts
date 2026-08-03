import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Review } from '../reviews/entities/review.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(CommunityView)
    private readonly viewRepository: Repository<CommunityView>,

    @InjectRepository(InviteClick)
    private readonly clickRepository: Repository<InviteClick>,

    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ){};

  findAll() {
    return this.userRepository.find();
  }

  async findByDiscordId(discordId: string) {
    return this.userRepository.findOne({
      where: { discordId },
    });
  }

  async createDiscordUser(profile: any) {
    const user = this.userRepository.create({
      discordId: profile.id,
      username: profile.username,
      displayName: profile.global_name || profile.username,
      avatar: profile.avatar,
      email: profile.email,
      verified: profile.verified,
      role: UserRole.USER,
    });

    return this.userRepository.save(user);
  }

  async updateDiscordUser(user: User, profile: any) {
    user.username = profile.username;
    user.displayName = profile.global_name || profile.username;
    user.avatar = profile.avatar;
    user.email = profile.email;
    user.verified = profile.verified;

    return this.userRepository.save(user);
  }

  async findById(id: number) {
  return this.userRepository.findOne({
    where: { id },
  });
}

  async getProfile(user: any) {
    const profile = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    if (!profile) {
      throw new NotFoundException('User not found.');
    }

    const communities =
      await this.communityRepository.count({
        where: {
          createdBy: {
            id: user.id,
          },
        },
      });

    const reviews =
      await this.reviewRepository.count({
        where: {
          reviewer: {
            id: user.id,
          },
        },
      });

    const ownedCommunities =
      await this.communityRepository.find({
        where: {
          createdBy: {
            id: user.id,
          },
        },
      });

    const totalPoints =
      ownedCommunities.reduce(
        (sum, community) =>
          sum + community.totalPoints,
        0,
      );

      let totalViews = 0;
      let totalClicks = 0;
      let totalFavorites = 0;
      let totalRating = 0;

      let bestCommunity: any = null;

      for (const community of ownedCommunities) {
        const views =
          await this.viewRepository.count({
            where: {
              community: {
                id: community.id,
              },
            },
          });

        const clicks =
          await this.clickRepository.count({
            where: {
              community: {
                id: community.id,
              },
            },
          });

        const favorites =
          await this.favoriteRepository.count({
            where: {
              community: {
                id: community.id,
              },
            },
          });

        totalViews += views;
        totalClicks += clicks;
        totalFavorites += favorites;
        totalRating += community.averageRating;

        if (
          !bestCommunity ||
          community.totalPoints >
            bestCommunity.points
        ) {
          bestCommunity = {
            id: community.id,
            name: community.name,
            views,
            clicks,
            favorites,
            rating: community.averageRating,
            points: community.totalPoints,
          };
        }
      }

      const averageRating =
      ownedCommunities.length > 0
        ? totalRating /
          ownedCommunities.length
        : 0;

    return {
      ...profile,

      avatarUrl: profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png',

      statistics: {
        communities,
        reviews,
        totalPoints,
      },

      analytics: {
        totalViews,
        totalClicks,
        totalFavorites,
        averageRating,
      },

      bestCommunity,

      communities: ownedCommunities,
    };
  }
}