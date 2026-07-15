import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Community } from '../../communities/entities/community.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class InviteClick {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Community)
  community!: Community;

  @ManyToOne(() => User, {
    nullable: true,
  })
  user?: User;

  @CreateDateColumn()
  clickedAt!: Date;
}