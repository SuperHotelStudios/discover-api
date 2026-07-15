import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommunityView } from './entities/community-view.entity';
import { Community } from '../communities/entities/community.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(CommunityView)
    private readonly viewRepository: Repository<CommunityView>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async recordView(
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

    let viewer: User | null = null;

    if (user?.id) {
      viewer =
        await this.userRepository.findOne({
          where: {
            id: user.id,
          },
        });
    }

    const view =
      this.viewRepository.create({
        community,
        viewer: viewer ?? undefined,
      });

    await this.viewRepository.save(view);

    return {
      message: 'View recorded.',
    };
  }

  async getTotalViews(
    communityId: number,
  ) {
    const totalViews =
      await this.viewRepository.count({
        where: {
          community: {
            id: communityId,
          },
        },
      });

    return {
      totalViews,
    };
  }
}