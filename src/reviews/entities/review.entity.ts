import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Community } from '../../communities/entities/community.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  // Community being reviewed
  @ManyToOne(() => Community)
  community!: Community;

  // User who reviewed
  @ManyToOne(() => User)
  reviewer!: User;

  // Rating (1-5)
  @Column()
  rating!: number;

  // Optional comment
  @Column({
    type: 'text',
    nullable: true,
  })
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;
}