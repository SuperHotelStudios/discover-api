import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
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