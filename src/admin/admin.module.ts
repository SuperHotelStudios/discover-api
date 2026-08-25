import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { OwnerGuard } from './guards/owner.guard';

import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';
import { AdvertisementEvent } from '../advertisements/entities/advertisement-event.entity';
import { AdvertisementEventDelivery } from '../advertisements/entities/advertisement-event-delivery.entity';

import { Category } from '../categories/entities/category.entity';
import { Review } from '../reviews/entities/review.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Report } from '../reports/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
    User,
    Community,
    Advertisement,
    AdvertisementEvent,
    AdvertisementEventDelivery,
    Category,
    Review,
    Favorite,
    CommunityView,
    InviteClick,
    Report,
  ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard, OwnerGuard],
})
export class AdminModule {}
