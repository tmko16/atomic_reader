import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  telegram_id: number;

  @Column({ type: 'varchar', length: 100 })
  telegram_username: string;
}
