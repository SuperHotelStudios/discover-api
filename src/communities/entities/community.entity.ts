import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class Community {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ length: 1000 })
  description!: string;

  @Column({ unique: true })
  inviteLink!: string;

  @Column({ nullable: true })
  logo!: string;

  @Column({ nullable: true })
  banner!: string;

  @Column()
  category!: string;

  @Column({ default: 0 })
  memberCount!: number;

  @Column({ default: false })
  verified!: boolean;

  @Column({ default: false })
  featured!: boolean;

  @ManyToOne(() => User)
  owner!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: 0 })
  totalPoints!: number;

  @Column({ default: 0 })
  averageRating!: number;

  @Column({ default: 0 })
  totalReviews!: number;

  @Column({ unique: true, nullable: true })
  discordGuildId!: string;
}