import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { defaultCategories } from './categories.seed';
import { User } from '../../users/entities/user.entity';
import { defaultUsers } from './users.seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seedCategories() {
    console.log('Seeding categories...');

    for (const category of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: {
          name: category.name,
        },
      });

      if (!exists) {
        await this.categoryRepository.save(category);
        console.log(`✓ ${category.name}`);
      }
    }

    console.log('Categories seeded successfully.');
  }

  async seedUsers() {
  console.log('Seeding default users...');

  for (const seededUser of defaultUsers) {
    const user = await this.userRepository.findOne({
      where: {
        discordId: seededUser.discordId,
      },
    });

    if (!user) {
      console.log(
        `⚠ User ${seededUser.discordId} not found. Skipping.`,
      );
      continue;
    }

    user.role = seededUser.role as any;

    await this.userRepository.save(user);

    console.log(
      `✓ ${user.username} → ${user.role}`,
    );
    }
  }

  async run() {
    await this.seedCategories();
    await this.seedUsers();
  }
}