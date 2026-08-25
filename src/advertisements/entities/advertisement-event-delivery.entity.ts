import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AdvertisementEventDelivery {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  eventId!: number;

  @Column({ length: 32 })
  adminDiscordId!: string;

  @Column({ length: 100 })
  adminUsername!: string;

  @Column({ length: 20 })
  status!: 'SENT' | 'FAILED';

  @Column({ type: 'varchar', length: 500, nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'datetime' })
  attemptedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}