import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      User,
      Community,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}