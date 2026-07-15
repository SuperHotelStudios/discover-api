import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,

    @InjectRepository(Advertisement)
    private readonly advertisementRepository: Repository<Advertisement>,
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

    return {
      statistics: {
        users,
        communities,
        advertisements,
        featured,
        verified,
      },
    };
  }
}