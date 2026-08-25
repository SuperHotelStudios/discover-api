import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import { DiscordModule } from '../discord/discord.module';
import { Advertisement } from './entities/advertisement.entity';
import { AdvertisementEvent } from './entities/advertisement-event.entity';
import { AdvertisementEventDelivery } from './entities/advertisement-event-delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Advertisement,
      AdvertisementEvent,
      AdvertisementEventDelivery,
      Community,
      User,
    ]),
    DiscordModule,
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService],
  exports: [AdvertisementsService],
})
export class AdvertisementsModule {}