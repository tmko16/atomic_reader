import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  nextOffset: number;

  @OneToOne(() => Content, (content) => content.user)
  @JoinColumn({ name: 'id' })
  user: User;
}
