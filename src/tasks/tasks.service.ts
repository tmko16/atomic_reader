import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Bot } from 'grammy';
import { BOT_INSTANCE } from 'src/bot/bot.constans';
import { ContentService } from 'src/content/content.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TasksService {
  constructor(
    private userService: UserService,
    private contentService: ContentService,
    @Inject(BOT_INSTANCE) private bot: Bot, // строго типизировано
  ) {}

  /**
   * Каждую минуту делаем запрос на получение пользователей у которых
   * выбрано нужное время отправки сообщения
   */
  @Cron('0 * * * * *')
  private async tick() {
    const time = new Date().toTimeString().slice(0, 5);
    const users = await this.userService.findReadyForTime(time);
    for (const u of users) {
      const chunk = await this.contentService.getNextChunk(u);
      if (chunk) await this.bot.api.sendMessage(u.telegramId, chunk);
    }
  }
}
