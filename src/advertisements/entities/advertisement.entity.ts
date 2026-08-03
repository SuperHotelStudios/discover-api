import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Community } from '../../communities/entities/community.entity';
import { User } from '../../users/entities/user.entity';

export enum AdvertisementStatus {
  ACTIVE = 'ACTIVE',
  REMOVED_LEFT_DISCOVER = 'REMOVED_LEFT_DISCOVER',
  REMOVED_ADMIN = 'REMOVED_ADMIN',
  REMOVED_COMMUNITY_DELETED = 'REMOVED_COMMUNITY_DELETED',
}

@Entity()
export class Advertisement {
  @PrimaryGeneratedColumn()
  id!: number;

  // Which community was advertised
  @ManyToOne(() => Community, {
    onDelete: 'CASCADE',
  })
  community!: Community;
  // Who advertised it
  @ManyToOne(() => User)
  advertiser!: User;

  // Points awarded for this advertisement
  @Column({ default: 5 })
  pointsAwarded!: number;

  // Advertisement Status
  @Column({
    type: 'enum',
    enum: AdvertisementStatus,
    default: AdvertisementStatus.ACTIVE,
  })
  status!: AdvertisementStatus;

  // When advertisement was created
  @CreateDateColumn()
  createdAt!: Date;

  // When it was removed (if ever)
  @Column({
    type: 'datetime',
    nullable: true,
  })
  removedAt!: Date | null;

  // Reason for removal
  @Column({ nullable: true })
  removeReason!: string;
}