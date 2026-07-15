import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { User } from './entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Review } from '../reviews/entities/review.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Community,
      Review,
      CommunityView,
      InviteClick,
      Favorite,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}