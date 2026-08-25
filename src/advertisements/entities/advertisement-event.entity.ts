import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AdvertisementEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  type!: string;

  @Column()
  advertisementId!: number;

  @Column()
  discordId!: string;

  @Column()
  username!: string;

  @Column()
  serverName!: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  banner!: string | null;

  @Column({ default: 0 })
  pointsRolledBack!: number;

  @Column({ length: 500 })
  reason!: string;

  @Column({ type: 'datetime' })
  occurredAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
