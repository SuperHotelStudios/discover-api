import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InviteClick } from './entities/invite-click.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClicksService {
  constructor(
    @InjectRepository(InviteClick)
    private readonly clickRepository: Repository<InviteClick>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async recordClick(
    communityId: number,
    user?: any,
  ) {
    const community =
      await this.communityRepository.findOne({
        where: {
          id: communityId,
        },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

    let clickedBy: User | null = null;

    if (user?.id) {
      clickedBy =
        await this.userRepository.findOne({
          where: {
            id: user.id,
          },
        });
    }

    const click =
      this.clickRepository.create({
        community,
        ...(clickedBy && {
          user: clickedBy,
        }),
      });

    await this.clickRepository.save(click);

    return {
      message: 'Click recorded.',
    };
  }

  async getTotalClicks(
    communityId: number,
  ) {
    const totalClicks =
      await this.clickRepository.count({
        where: {
          community: {
            id: communityId,
          },
        },
      });

    return {
      totalClicks,
    };
  }
}