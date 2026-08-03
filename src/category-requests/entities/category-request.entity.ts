import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum CategoryRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class CategoryRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: CategoryRequestStatus,
    default: CategoryRequestStatus.PENDING,
  })
  status!: CategoryRequestStatus;

  @ManyToOne(() => User)
  requestedBy!: User;

  @ManyToOne(() => User, {
    nullable: true,
  })
  reviewedBy?: User;

  @Column({
    nullable: true,
    type: 'text',
  })
  rejectionReason?: string;

  @Column({
    nullable: true,
  })
  reviewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 10 })
  icon!: string;
}
