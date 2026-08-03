import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Advertisement, AdvertisementStatus } from './entities/advertisement.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';
import { DiscordService } from '../discord/discord.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly discordService: DiscordService,
  ) {}

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
    // STEP 2 : Cooldown Check
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