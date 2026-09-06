import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  discordId!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  displayName!: string;

  @Column({ nullable: true })
  avatar!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ default: false })
  verified!: boolean;

  @Column({ default: false })
  isBanned!: boolean;

  @Column({ type: 'text', nullable: true })
  banReason!: string | null;

  @Column({ type: 'datetime', nullable: true })
  bannedAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  bannedById!: number | null;

  @Column({ type: 'text', nullable: true })
  unbanReason!: string | null;

  @Column({ type: 'datetime', nullable: true })
  unbannedAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  unbannedById!: number | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  lastAdvertisementAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
