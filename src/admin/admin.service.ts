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
import { TicketTranscript } from '../transcripts/entities/transcript.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { TicketRating } from '../ratings/entities/rating.entity';

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

    @InjectRepository(TicketTranscript)
    private readonly transcriptRepository: Repository<TicketTranscript>,

    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,

    @InjectRepository(TicketRating)
    private readonly ratingRepository: Repository<TicketRating>,
  ) {}

  async getDashboard() {
    const users =
      await this.userRepository.count();

    const transcripts = await this.transcriptRepository.count();

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
        transcripts,
        partnerLeftEvents: partnerLeftEventsWithDeliveries,
      },
    };
  }

  async createTranscript(data: {
    ticketType: string;
    ticketName: string;
    ownerDiscordId: string;
    ownerUsername: string;
    closedBy?: string | null;
    guildId?: string | null;
    channelId: string;
    transcriptText: string;
  }) {
    const existingTranscript = await this.transcriptRepository.findOne({
      where: { channelId: data.channelId },
    });
    const transcript = existingTranscript || this.transcriptRepository.create();

    Object.assign(transcript, {
      ticketType: data.ticketType,
      ticketName: data.ticketName,
      ownerDiscordId: data.ownerDiscordId,
      ownerUsername: data.ownerUsername,
      closedBy: data.closedBy || null,
      guildId: data.guildId || null,
      channelId: data.channelId,
      transcriptText: data.transcriptText,
    });

    const saved = await this.transcriptRepository.save(transcript);
    return {
      id: saved.id,
      ticketType: saved.ticketType,
      ticketName: saved.ticketName,
      ownerUsername: saved.ownerUsername,
      createdAt: saved.createdAt,
    };
  }

  async getTranscripts(filters: { type?: string; user?: string; staff?: string; from?: string; to?: string; page?: number; limit?: number } = {}) {
    const query = this.transcriptRepository.createQueryBuilder('transcript').orderBy('transcript.createdAt', 'DESC');
    if (filters.type) query.andWhere('transcript.ticketType = :type', { type: filters.type });
    if (filters.user) query.andWhere('(transcript.ownerUsername LIKE :user OR transcript.ownerDiscordId LIKE :user)', { user: `%${filters.user}%` });
    if (filters.staff) query.andWhere('transcript.closedBy LIKE :staff', { staff: `%${filters.staff}%` });
    if (filters.from) query.andWhere('transcript.createdAt >= :from', { from: filters.from });
    if (filters.to) query.andWhere('transcript.createdAt <= :to', { to: `${filters.to} 23:59:59` });
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
    const [items, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createAuditLog(data: Partial<AuditLog>) {
    return this.auditLogRepository.save(this.auditLogRepository.create(data));
  }

  async getAuditLogs(filters: { action?: string; executor?: string; target?: string; from?: string; to?: string; page?: number; limit?: number } = {}) {
    const query = this.auditLogRepository.createQueryBuilder('audit').orderBy('audit.createdAt', 'DESC');
    if (filters.action) query.andWhere('audit.action = :action', { action: filters.action });
    if (filters.executor) query.andWhere('(audit.executorName LIKE :executor OR audit.executorId LIKE :executor)', { executor: `%${filters.executor}%` });
    if (filters.target) query.andWhere('(audit.targetName LIKE :target OR audit.targetId LIKE :target)', { target: `%${filters.target}%` });
    if (filters.from) query.andWhere('audit.createdAt >= :from', { from: filters.from });
    if (filters.to) query.andWhere('audit.createdAt <= :to', { to: `${filters.to} 23:59:59` });
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
    const [items, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRating(channelId: string, userDiscordId: string) {
    return this.ratingRepository.findOne({ where: { channelId, userDiscordId } });
  }

  async saveRating(data: Partial<TicketRating>) {
    const rating = this.ratingRepository.create(data);
    return this.ratingRepository.save(rating);
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
