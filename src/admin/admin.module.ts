import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';
import { Advertisement } from '../advertisements/entities/advertisement.entity';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
  TypeOrmModule.forFeature([
    User,
    Community,
    Advertisement,
  ]),
],
})

export class AdminModule {}