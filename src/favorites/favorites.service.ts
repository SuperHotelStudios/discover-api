import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Favorite } from './entities/favorite.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async toggleFavorite(
    communityId: number,
    jwtUser: any,
  ) {
    const community =
      await this.communityRepository.findOne({
        where: {
          id: communityId,
        },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          id: jwtUser.id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found.',
      );
    }

    const existing =
      await this.favoriteRepository.findOne({
        where: {
          community: {
            id: communityId,
          },
          user: {
            id: user.id,
          },
        },
      });

    if (existing) {
      await this.favoriteRepository.remove(existing);

      return {
        favorited: false,
        message: 'Removed from favorites.',
      };
    }

    const favorite =
      this.favoriteRepository.create({
        community,
        user,
      });

    await this.favoriteRepository.save(favorite);

    return {
      favorited: true,
      message: 'Added to favorites.',
    };
  }

  async getFavorites(
    communityId: number,
    jwtUser?: any,
  ) {
    const favoriteCount =
      await this.favoriteRepository.count({
        where: {
          community: {
            id: communityId,
          },
        },
      });

    let isFavorited = false;

    if (jwtUser?.id) {
      const favorite =
        await this.favoriteRepository.findOne({
          where: {
            community: {
              id: communityId,
            },
            user: {
              id: jwtUser.id,
            },
          },
        });

      isFavorited = !!favorite;
    }

    return {
      favoriteCount,
      isFavorited,
    };
  }
}