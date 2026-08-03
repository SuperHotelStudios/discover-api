import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Report,
  ReportStatus,
} from './entities/report.entity';

import { User } from '../users/entities/user.entity';
import { Community } from '../communities/entities/community.entity';

import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async create(
    dto: CreateReportDto,
    user: User,
  ) {
    const community =
      await this.communityRepository.findOne({
        where: {
          id: dto.communityId,
        },
      });

    if (!community) {
      throw new NotFoundException(
        'Community not found.',
      );
    }

const SIX_HOURS = 6 * 60 * 60 * 1000;

const latestReport =
  await this.reportRepository.findOne({
    where: {
      community: {
        id: community.id,
      },
      reportedBy: {
        id: user.id,
      },
    },
    order: {
      createdAt: 'DESC',
    },
  });

    if (latestReport) {
      const elapsed =
        Date.now() -
        new Date(
          latestReport.createdAt,
        ).getTime();

      if (elapsed < SIX_HOURS) {
        const remaining =
          SIX_HOURS - elapsed;

        const hours = Math.floor(
          remaining /
            (1000 * 60 * 60),
        );

        const minutes = Math.floor(
          (remaining %
            (1000 * 60 * 60)) /
            (1000 * 60),
        );

        throw new ConflictException(
          `You can report this community again in ${hours}h ${minutes}m.`,
        );
      }
    }

    const report =
      this.reportRepository.create({
        community,
        reportedBy: user,
        reason: dto.reason,
        description: dto.description,
      });

    await this.reportRepository.save(report);
      const pendingReports =
      await this.reportRepository.count({
        where: {
          community: {
            id: community.id,
          },
          status: ReportStatus.PENDING,
        },
      });

    if (
      pendingReports >= 10 &&
      !community.hidden
    ) {
      community.hidden = true;
      community.hiddenReason =
        'Automatically hidden due to excessive pending reports.';

      await this.communityRepository.save(
        community,
      );
    }

    return {
      message:
        'Report submitted successfully.',
    };
  }

  async findMyReports(user: User) {
    return this.reportRepository.find({
      where: {
        reportedBy: {
          id: user.id,
        },
      },
      relations: [
        'community',
        'community.createdBy',
        'reviewedBy',
        'reportedBy',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAll(status?: ReportStatus) {
    const where = status
      ? { status }
      : {};

    return this.reportRepository.find({
      where,
      relations: [
        'community',
        'community.createdBy',
        'reportedBy',
        'reviewedBy',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async resolve(
  id: number,
  dto: ReviewReportDto,
  admin: User,
) {
  const report =
    await this.reportRepository.findOne({
      where: {
        id,
      },
    });

  if (!report) {
    throw new NotFoundException(
      'Report not found.',
    );
  }

  report.status = ReportStatus.RESOLVED;
  report.reviewedBy = admin;
  report.reviewedAt = new Date();
  report.adminNote = dto.note;

  await this.reportRepository.save(report);

  return {
    message: 'Report resolved successfully.',
  };
}

async reject(
  id: number,
  dto: ReviewReportDto,
  admin: User,
) {
  const report =
    await this.reportRepository.findOne({
      where: {
        id,
      },
    });

  if (!report) {
    throw new NotFoundException(
      'Report not found.',
    );
  }

  report.status = ReportStatus.REJECTED;
  report.reviewedBy = admin;
  report.reviewedAt = new Date();
  report.adminNote = dto.note;

  await this.reportRepository.save(report);

  return {
    message: 'Report rejected successfully.',
  };
}
}