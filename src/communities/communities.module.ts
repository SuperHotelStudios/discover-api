import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';

import { Community } from './entities/community.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { Review } from '../reviews/entities/review.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      Advertisement,
      Review,
      CommunityView,
      InviteClick,
      Favorite,
    ]),
  ],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}