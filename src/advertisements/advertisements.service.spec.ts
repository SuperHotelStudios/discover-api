import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementsService } from './advertisements.service';
import { AdvertisementStatus } from './entities/advertisement.entity';
import { DiscordService } from '../discord/discord.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Advertisement } from './entities/advertisement.entity';
import { AdvertisementEvent } from './entities/advertisement-event.entity';
import { AdvertisementEventDelivery } from './entities/advertisement-event-delivery.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

describe('AdvertisementsService', () => {
  let service: AdvertisementsService;
  let advertisementRepository: Record<string, jest.Mock>;
  let communityRepository: Record<string, jest.Mock>;
  let advertisementEventRepository: Record<string, jest.Mock>;
  let advertisementEventDeliveryRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    advertisementRepository = {
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    communityRepository = {
      save: jest.fn(),
    };
    advertisementEventRepository = {
      create: jest.fn((event) => event),
      save: jest.fn(),
    };
    advertisementEventDeliveryRepository = {
      create: jest.fn((delivery) => delivery),
      save: jest.fn((delivery) => delivery),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvertisementsService,
        {
          provide: getRepositoryToken(Advertisement),
          useValue: advertisementRepository,
        },
        {
          provide: getRepositoryToken(Community),
          useValue: communityRepository,
        },
        {
          provide: getRepositoryToken(AdvertisementEvent),
          useValue: advertisementEventRepository,
        },
        {
          provide: getRepositoryToken(AdvertisementEventDelivery),
          useValue: advertisementEventDeliveryRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: DiscordService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdvertisementsService>(AdvertisementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('removes active advertisements and rolls back awarded points', async () => {
    const community = { totalPoints: 12 };
    const advertisement = {
      status: AdvertisementStatus.ACTIVE,
      advertiser: { discordId: 'discord-user-id' },
      community,
      pointsAwarded: 5,
      removedAt: null,
      removeReason: null,
    };
    advertisementRepository.find.mockResolvedValue([advertisement]);

    const result = await service.removeForLeftServer('discord-user-id');

    expect(result.removed).toBe(1);
    expect(advertisement.status).toBe(AdvertisementStatus.REMOVED_LEFT_DISCOVER);
    expect(advertisement.removedAt).toEqual(expect.any(Date));
    expect(advertisement.removeReason).toBe(
      'User left the main Discover Discord server.',
    );
    expect(community.totalPoints).toBe(7);
    expect(advertisementRepository.save).toHaveBeenCalledWith(advertisement);
    expect(communityRepository.save).toHaveBeenCalledWith(community);
  });

  it('does not remove anything when the user has no active advertisements', async () => {
    advertisementRepository.find.mockResolvedValue([]);

    await expect(
      service.removeForLeftServer('discord-user-id'),
    ).resolves.toEqual({
      removed: 0,
      message: 'No active advertisements to remove.',
    });
    expect(communityRepository.save).not.toHaveBeenCalled();
  });

  it('records administrator delivery status for an event', async () => {
    await expect(
      service.recordEventDelivery(42, {
        adminDiscordId: 'admin-id',
        adminUsername: 'Admin',
        status: 'FAILED',
        errorMessage: 'DMs disabled',
      }),
    ).resolves.toEqual(expect.objectContaining({
      eventId: 42,
      status: 'FAILED',
      errorMessage: 'DMs disabled',
      attemptedAt: expect.any(Date),
    }));
  });

  it('deletes only removed advertisements older than thirty days', async () => {
    const oldRemoved = {
      status: AdvertisementStatus.REMOVED_LEFT_DISCOVER,
      removedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    };
    const recentRemoved = {
      status: AdvertisementStatus.REMOVED_ADMIN,
      removedAt: new Date(),
    };
    const active = {
      status: AdvertisementStatus.ACTIVE,
      removedAt: null,
    };
    advertisementRepository.find.mockResolvedValue([
      oldRemoved,
      recentRemoved,
      active,
    ]);

    await expect(service.purgeExpiredRemovedAdvertisements()).resolves.toEqual(
      expect.objectContaining({ deleted: 1 }),
    );
    expect(advertisementRepository.remove).toHaveBeenCalledWith([oldRemoved]);
  });
});
