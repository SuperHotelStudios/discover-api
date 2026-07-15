import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';

import { CommunityView } from './entities/community-view.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityView,
      Community,
      User,
    ]),
  ],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}