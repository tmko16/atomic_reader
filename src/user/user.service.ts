import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByTelegramId(id: number) {
    return this.repo.findOne({
      where: { telegramId: id },
      relations: ['content'],
    });
  }

  async create(data: { telegramId: number; telegramUsername?: string }) {
    return this.repo.save(this.repo.create(data));
  }

  async setSendAt(telegramId: number, sendAt: string) {
    await this.repo.update({ telegramId }, { sendAt });
  }
  // user.service.ts
  async findReadyForTime(sendAt: string) {
    return this.repo.find({
      where: { sendAt },
      relations: { content: true },
    });
  }
}
