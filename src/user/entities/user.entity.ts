import { Content } from 'src/content/entities/content.entities';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'bigint', unique: true, nullable: true })
  telegramId: number;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  telegramUserName: string;

  @Column({ type: 'time', nullable: true })
  sendAt?: string;

  @OneToOne(() => Content, (content) => content.user)
  content?: Content;
}
