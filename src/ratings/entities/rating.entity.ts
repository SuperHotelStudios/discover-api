import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['channelId', 'userDiscordId'])
export class TicketRating {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  channelId!: string;

  @Column({ length: 255 })
  userDiscordId!: string;

  @Column({ type: 'tinyint' })
  score!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
