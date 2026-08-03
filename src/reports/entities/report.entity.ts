import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Community } from '../../communities/entities/community.entity';

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum ReportReason {
  SPAM = 'SPAM',
  NSFW = 'NSFW',
  HARASSMENT = 'HARASSMENT',
  SCAM = 'SCAM',
  HATE_SPEECH = 'HATE_SPEECH',
  MISLEADING = 'MISLEADING',
  OTHER = 'OTHER',
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Community, {
    onDelete: 'CASCADE',
  })
  community!: Community;

  @ManyToOne(() => User)
  reportedBy!: User;

  @ManyToOne(() => User, {
    nullable: true,
  })
  reviewedBy?: User;

  @Column({
    type: 'enum',
    enum: ReportReason,
  })
  reason!: ReportReason;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status!: ReportStatus;

@Column({
  type: 'datetime',
  nullable: true,
})
reviewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({
  type: 'text',
  nullable: true,
})
adminNote?: string;
}