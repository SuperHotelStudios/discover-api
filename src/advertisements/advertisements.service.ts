import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Advertisement, AdvertisementStatus } from './entities/advertisement.entity';
import { AdvertisementEvent } from './entities/advertisement-event.entity';
import { AdvertisementEventDelivery } from './entities/advertisement-event-delivery.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';
import { DiscordService } from '../discord/discord.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(AdvertisementEvent)
    private readonly advertisementEventRepository: Repository<AdvertisementEvent>,

    @InjectRepository(AdvertisementEventDelivery)
    private readonly advertisementEventDeliveryRepository: Repository<AdvertisementEventDelivery>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly discordService: DiscordService,
  ) {}

  async findActiveAdvertisements() {
    return this.advertisementRepository.find({
      where: {
        status: AdvertisementStatus.ACTIVE,
      },
      relations: ['advertiser', 'community'],
    });
  }

  async purgeExpiredRemovedAdvertisements() {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - THIRTY_DAYS);

    const expiredAdvertisements = await this.advertisementRepository.find({
      where: {
        status: Not(AdvertisementStatus.ACTIVE),
      },
      relations: ['advertiser', 'community'],
    });

    const toDelete = expiredAdvertisements.filter((ad) => {
      if (!ad.removedAt) {
        return false;
      }
      return ad.removedAt.getTime() < cutoff.getTime();
    });

    if (!toDelete.length) {
      return { deleted: 0, message: 'No expired removed advertisements found.' };
    }

    await this.advertisementRepository.remove(toDelete);

    return {
      deleted: toDelete.length,
      message: 'Expired removed advertisements were deleted successfully.',
    };
  }

  async removeForLeftServer(discordId: string) {
    const advertisements = await this.advertisementRepository.find({
      where: {
        status: AdvertisementStatus.ACTIVE,
        advertiser: {
          discordId,
        },
      },
      relations: ['advertiser', 'community'],
    });

    if (!advertisements.length) {
      return { removed: 0, message: 'No active advertisements to remove.' };
    }

    const now = new Date();
    const eventIds = new Map<number, number>();

    for (const advertisement of advertisements) {
      advertisement.status = AdvertisementStatus.REMOVED_LEFT_DISCOVER;
      advertisement.removedAt = now;
      advertisement.removeReason = 'User left the main Discover Discord server.';
      await this.advertisementRepository.save(advertisement);

      advertisement.community.totalPoints = Math.max(
        0,
        advertisement.community.totalPoints - advertisement.pointsAwarded,
      );
      await this.communityRepository.save(advertisement.community);

      const event = await this.advertisementEventRepository.save(
        this.advertisementEventRepository.create({
          type: 'PARTNER_LEFT_DISCOVER',
          advertisementId: advertisement.id,
          discordId: advertisement.advertiser.discordId,
          username: advertisement.advertiser.username,
          serverName: advertisement.community.name,
          banner: advertisement.community.banner || null,
          pointsRolledBack: advertisement.pointsAwarded,
          reason: advertisement.removeReason,
          occurredAt: now,
        }),
      );
      eventIds.set(advertisement.id, event?.id);
    }

    return {
      removed: advertisements.length,
      message: 'Active advertisements removed for users who left the main server.',
      advertisements: advertisements.map((advertisement) => ({
        serverName: advertisement.community.name,
        eventId: eventIds.get(advertisement.id),
        banner: advertisement.community.banner,
        username: advertisement.advertiser.username,
        discordId: advertisement.advertiser.discordId,
        removedAt: advertisement.removedAt,
        removeReason: advertisement.removeReason,
      })),
    };
  }

  async recordEventDelivery(
    eventId: number,
    delivery: {
      adminDiscordId: string;
      adminUsername: string;
      status: 'SENT' | 'FAILED';
      errorMessage?: string | null;
    },
  ) {
    return this.advertisementEventDeliveryRepository.save(
      this.advertisementEventDeliveryRepository.create({
        eventId,
        ...delivery,
        errorMessage: delivery.errorMessage || null,
        attemptedAt: new Date(),
      }),
    );
  }

  async create(
    createAdvertisementDto: CreateAdvertisementDto,
    user: any,
  ) {
    // ============================
    // STEP 1 : Find Logged-in User
    // ============================

    const dbUser = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      throw new NotFoundException('User not found.');
    }

    // ============================
    // STEP 2 : Server Check
    // ============================

    const isInServer = await this.discordService.isUserInGuild(dbUser.discordId);

    if (!isInServer) {
      throw new BadRequestException(
        'You must be in the main Discover Discord server to advertise.',
      );
    }

    // ============================
    // STEP 3 : Cooldown Check
    // ============================

    const SIX_HOURS = 6 * 60 * 60 * 1000;

    if (dbUser.lastAdvertisementAt) {
      const elapsed =
        Date.now() -
        new Date(dbUser.lastAdvertisementAt).getTime();

      if (elapsed < SIX_HOURS) {
        const remaining = SIX_HOURS - elapsed;

        const hours = Math.floor(
          remaining / (1000 * 60 * 60),
        );

        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) /
            (1000 * 60),
        );

        throw new BadRequestException(
          `You can advertise again in ${hours}h ${minutes}m.`,
        );
      }
    }

    // ============================
    // STEP 3 : Discord Invite
    // ============================

    if (  
      createAdvertisementDto.banner.includes(
        'media.discordapp.net/attachments',
      ) ||
      createAdvertisementDto.banner.includes(
        'cdn.discordapp.com/attachments',
      )
    ) {
      throw new BadRequestException(
        'Discord attachment links expire and are not supported. Please use a permanent image host like Imgur, Imgbox, or Postimages.',
      );
    }

    const discordCommunity =
      await this.discordService.getInviteInfo(
        createAdvertisementDto.inviteLink,
      );

    // ============================
    // STEP 4 : Find Community
    // ============================

    let community =
      await this.communityRepository.findOne({
        where: {
          discordGuildId:
            discordCommunity.discordGuildId,
        },
      });

    // ============================
    // STEP 5 : Create Community
    // ============================

    if (!community) {
      community =
        this.communityRepository.create({
          name: discordCommunity.name,
          inviteLink:
            discordCommunity.inviteLink,
          logo: discordCommunity.logo,
          memberCount:
            discordCommunity.memberCount,
          discordGuildId:
            discordCommunity.discordGuildId,

          description:
            createAdvertisementDto.description,
          banner:
            createAdvertisementDto.banner,
          category:
            createAdvertisementDto.category,

          createdBy: dbUser,
        });
    }

    // ============================
    // STEP 6 : Refresh Community
    // ============================

    community.name = discordCommunity.name;
    community.inviteLink =
      discordCommunity.inviteLink;
    community.logo = discordCommunity.logo;
    community.memberCount =
      discordCommunity.memberCount;

    community.description =
      createAdvertisementDto.description;

    community.banner =
      createAdvertisementDto.banner;

    community.category =
      createAdvertisementDto.category;

    await this.communityRepository.save(
      community,
    );

    // ============================
    // STEP 7 : Already Advertised?
    // ============================

    const activeAdvertisement =
      await this.advertisementRepository.findOne({
        where: {
          community: {
            id: community.id,
          },
          status:
            AdvertisementStatus.ACTIVE,
        },
        relations: ['community'],
      });

    if (activeAdvertisement) {
      throw new BadRequestException(
        'This community is already advertised.',
      );
    }

    // ============================
    // STEP 8 : Create Advertisement
    // ============================

    const advertisement =
      this.advertisementRepository.create({
        community,
        advertiser: dbUser,
        pointsAwarded: 5,
        status: AdvertisementStatus.ACTIVE,
      });

    await this.advertisementRepository.save(
      advertisement,
    );

    // ============================
    // STEP 9 : Award Points
    // ============================

    community.totalPoints +=
      advertisement.pointsAwarded;

    await this.communityRepository.save(
      community,
    );

    // ============================
    // STEP 10 : Start Cooldown
    // ============================

    dbUser.lastAdvertisementAt =
      new Date();

    await this.userRepository.save(
      dbUser,
    );

    // ============================
    // STEP 11 : Reload Advertisement
    // ============================

    const savedAdvertisement =
      await this.advertisementRepository.findOne({
        where: {
          id: advertisement.id,
        },
        relations: [
          'community',
          'advertiser',
        ],
      });

    // ============================
    // STEP 12 : Success
    // ============================

    return {
      message:
        'Community advertised successfully!',
      advertisement: savedAdvertisement,
    };
  }
}