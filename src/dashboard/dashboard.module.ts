import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Community } from '../communities/entities/community.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Community,
      CommunityView,
      InviteClick,
      Favorite,
      Review,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}