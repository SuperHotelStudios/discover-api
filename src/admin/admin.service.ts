import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import {
  Advertisement,
  AdvertisementStatus,
} from '../advertisements/entities/advertisement.entity';
import { Category } from '../categories/entities/category.entity';
import { Review } from '../reviews/entities/review.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { CommunityView } from '../views/entities/community-view.entity';
import { InviteClick } from '../clicks/entities/invite-click.entity';
import { Report } from '../reports/entities/report.entity';
import { AdvertisementEvent } from '../advertisements/entities/advertisement-event.entity';
import { AdvertisementEventDelivery } from '../advertisements/entities/advertisement-event-delivery.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(CommunityView)
    private readonly viewRepository: Repository<CommunityView>,

    @InjectRepository(InviteClick)
    private readonly clickRepository: Repository<InviteClick>,

    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(AdvertisementEvent)
    private readonly advertisementEventRepository: Repository<AdvertisementEvent>,

    @InjectRepository(AdvertisementEventDelivery)
    private readonly advertisementEventDeliveryRepository: Repository<AdvertisementEventDelivery>,
    
  ) {}

  async getDashboard() {
    const users =
      await this.userRepository.count();

    const communities =
      await this.communityRepository.count();

    const advertisements =
      await this.advertisementRepository.count();

    const featured =
      await this.communityRepository.count({
        where: {
          featured: true,
        },
      });

    const verified =
      await this.communityRepository.count({
        where: {
          verified: true,
        },
      });

    const categories =
      await this.categoryRepository.count();

    const reviews =
      await this.reviewRepository.count();

    const favorites =
      await this.favoriteRepository.count();

    const views =
      await this.viewRepository.count();

    const clicks =
      await this.clickRepository.count();

    const partnerLeftEvents = await this.advertisementEventRepository.find({
      where: { type: 'PARTNER_LEFT_DISCOVER' },
      order: { occurredAt: 'DESC' },
      take: 20,
    });
    const eventIds = partnerLeftEvents.map((event) => event.id);
    const deliveries = eventIds.length
      ? await this.advertisementEventDeliveryRepository.find({
          where: eventIds.map((eventId) => ({ eventId })),
          order: { attemptedAt: 'DESC' },
        })
      : [];
    const deliveriesByEvent = new Map<number, AdvertisementEventDelivery[]>();

    for (const delivery of deliveries) {
      const eventDeliveries = deliveriesByEvent.get(delivery.eventId) || [];
      eventDeliveries.push(delivery);
      deliveriesByEvent.set(delivery.eventId, eventDeliveries);
    }

    const partnerLeftEventsWithDeliveries = partnerLeftEvents.map((event) => ({
      ...event,
      deliveries: deliveriesByEvent.get(event.id) || [],
    }));

    return {
      statistics: {
        users,
        communities,
        advertisements,
        featured,
        verified,
        categories,
        reviews,
        favorites,
        views,
        clicks,
        partnerLeftEvents: partnerLeftEventsWithDeliveries,
      },
    };
  }

  async getCommunities() {
    const activeAdvertisements = await this.advertisementRepository.find({
      where: { status: AdvertisementStatus.ACTIVE },
      relations: ['community'],
    });
    const activeCommunityIds = activeAdvertisements.map(
      (advertisement) => advertisement.community.id,
    );

    if (!activeCommunityIds.length) {
      return [];
    }

    return this.communityRepository.find({
      where: { id: In(activeCommunityIds) },
      relations: ['createdBy'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getUsers(search = '') {
    const query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (search.trim()) {
      query.where(
        new Brackets((subQuery) => {
          subQuery
            .where('user.username LIKE :search', {
              search: `%${search.trim()}%`,
            })
            .orWhere('user.displayName LIKE :search', {
              search: `%${search.trim()}%`,
            })
            .orWhere('user.discordId LIKE :search', {
              search: `%${search.trim()}%`,
            });
        }),
      );
    }

    const users = await query.getMany();

    return users.map((user) => ({
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      verified: user.verified,
      isBanned: user.isBanned,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
      unbanReason: user.unbanReason,
      unbannedAt: user.unbannedAt,
      createdAt: user.createdAt,
    }));
  }

  async updateUserRole(
    userId: number,
    role: UserRole,
    actor: User,
  ) {
    const user = await this.findManageableUser(userId, actor);
    user.role = role;
    await this.userRepository.save(user);

    return { message: `${user.displayName || user.username}'s role was updated.` };
  }

  async banUser(userId: number, reason: string, actor: User) {
    const user = await this.findManageableUser(userId, actor);
    user.isBanned = true;
    user.banReason = reason.trim();
    user.bannedAt = new Date();
    user.bannedById = actor.id;
    user.unbanReason = null;
    user.unbannedAt = null;
    user.unbannedById = null;
    await this.userRepository.save(user);

    return { message: `${user.displayName || user.username} was banned.` };
  }

  async unbanUser(userId: number, reason: string, actor: User) {
    const user = await this.findManageableUser(userId, actor);
    user.isBanned = false;
    user.unbanReason = reason.trim();
    user.unbannedAt = new Date();
    user.unbannedById = actor.id;
    await this.userRepository.save(user);

    return { message: `${user.displayName || user.username} was unbanned.` };
  }

  private async findManageableUser(userId: number, actor: User) {
    if (userId === actor.id) {
      throw new ForbiddenException('You cannot change your own account.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === UserRole.OWNER) {
      throw new ForbiddenException('Owner accounts cannot be changed.');
    }

    return user;
  }

  async verifyCommunity(id: number) {
  const community =
    await this.communityRepository.findOne({
      where: { id },
    });

  if (!community) {
    throw new NotFoundException(
      'Community not found.',
    );
  }

  community.verified =
    !community.verified;

  await this.communityRepository.save(
    community,
  );

  return {
    message: community.verified
      ? 'Community verified.'
      : 'Community unverified.',
  };
}

  async featureCommunity(id: number) {
    const community =
      await this.communityRepository.findOne({
        where: { id },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    community.featured =
      !community.featured;

    await this.communityRepository.save(
      community,
    );

    return {
      message: community.featured
        ? 'Community featured.'
        : 'Community removed from featured.',
    };
  }

  async toggleHidden(id: number) {
    const community =
      await this.communityRepository.findOne({
        where: { id },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    community.hidden =
      !community.hidden;

    if (community.hidden) {
      community.hiddenReason =
        'Hidden by administrator.';
    } else {
      community.hiddenReason = undefined;
    }

    await this.communityRepository.save(
      community,
    );

    return {
      message: community.hidden
        ? 'Community hidden.'
        : 'Community restored.',
    };
    
  }
async deleteCommunity(
  id: number,
  reason: string,
) {
  console.log('\n========== DELETE COMMUNITY ==========');
  console.log('Community ID:', id);
  console.log('Reason:', reason);

  const community =
    await this.communityRepository.findOne({
      where: { id },
    });

  console.log('Community Found:', community);

  if (!community) {
    console.log('Community does not exist.');
    throw new NotFoundException(
      'Community not found.',
    );
  }

  console.log('Community exists. Starting deletion...');

  // Delete reports
  await this.reportRepository
    .createQueryBuilder()
    .delete()
    .from(Report)
    .where('communityId = :id', { id })
    .execute();

  // Delete reviews
  await this.reviewRepository
    .createQueryBuilder()
    .delete()
    .from(Review)
    .where('communityId = :id', { id })
    .execute();

  // Delete favorites
  await this.favoriteRepository
    .createQueryBuilder()
    .delete()
    .from(Favorite)
    .where('communityId = :id', { id })
    .execute();

  // Delete views
  const qb = this.viewRepository
    .createQueryBuilder()
    .delete()
    .from(CommunityView)
    .where("communityId = :id", { id });

  console.log(qb.getSql());

  const result = await qb.execute();

  console.log(result);

  // Delete invite clicks
  await this.clickRepository
    .createQueryBuilder()
    .delete()
    .from(InviteClick)
    .where('communityId = :id', { id })
    .execute();

  // Delete advertisements
  await this.advertisementRepository
    .createQueryBuilder()
    .delete()
    .from(Advertisement)
    .where('communityId = :id', { id })
    .execute();

  // Finally delete the community
  await this.communityRepository.delete(id);

  return {
    message: 'Community deleted successfully.',
    reason,
  };
}
}
