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

    // Проверяем, не достигли ли мы конца файла
    if (t.nextOffset >= t.content.length) return null;

    // Получаем следующий чанк правильного размера
    const chunkSize = 200;
    const endOffset = Math.min(t.nextOffset + chunkSize, t.content.length);
    const chunk = t.content.substring(t.nextOffset, endOffset);

    // Обновляем offset
    t.nextOffset = endOffset;
    await this.repo.save(t);

    return chunk;
  }
}
// ... existing code ...

// ... existing code ...
