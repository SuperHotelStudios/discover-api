import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TicketTranscript {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  ticketType!: string;

  @Column({ length: 120 })
  ticketName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ownerDiscordId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  ownerUsername?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  closedBy?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guildId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  channelId?: string | null;

  @Column({ type: 'text' })
  transcriptText!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
