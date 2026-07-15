import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { Community } from '../../communities/entities/community.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
@Unique(['community', 'user'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Community)
  community!: Community;

  @ManyToOne(() => User)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}