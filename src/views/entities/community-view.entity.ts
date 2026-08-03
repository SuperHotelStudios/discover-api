import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Community } from '../../communities/entities/community.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class CommunityView {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Community, {
    onDelete: 'CASCADE',
  })
  community!: Community;

  @ManyToOne(() => User, {
    nullable: true,
  })
  viewer?: User;

  @CreateDateColumn()
  viewedAt!: Date;
}