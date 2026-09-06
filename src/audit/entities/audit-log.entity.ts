import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  action!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guildId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  executorId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  executorName?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  targetName?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @Column({ type: 'text' })
  logText!: string;

  @Column({ type: 'json', nullable: true })
  embedData?: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
