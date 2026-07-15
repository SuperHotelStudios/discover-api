import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClicksController } from './clicks.controller';
import { ClicksService } from './clicks.service';

import { InviteClick } from './entities/invite-click.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InviteClick,
      Community,
      User,
    ]),
  ],
  controllers: [ClicksController],
  providers: [ClicksService],
})
export class ClicksModule {}