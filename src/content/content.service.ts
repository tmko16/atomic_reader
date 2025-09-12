import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './entities/content.entities';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ContentService {
  constructor(@InjectRepository(Content) private repo: Repository<Content>) {}

  async saveForUser(user: User, content: string) {
    if (user.content) {
      user.content.content = content;
      user.content.nextOffset = 0;
      return this.repo.save(user.content);
    }
    const newContent = this.repo.create({ content, user });
    return this.repo.save(newContent);
  }

  async getNextChunk(user: User) {
    if (!user.content) return null;
    const t = user.content;
    const chunk = t.content.substring(t.nextOffset, 200);
    if (!chunk) return null;
    t.nextOffset += 200;
    await this.repo.save(t);
    return chunk;
  }
}
