import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from 'src/user/user.module';
import { ContentModule } from 'src/content/content.module';
import { BOT_INSTANCE } from './bot.constans';
import { Bot } from 'grammy';

@Module({
  imports: [UserModule, ContentModule],
  providers: [
    BotService,
    {
      provide: BOT_INSTANCE,
      useFactory: () => {
        const token = process.env.TG_TOKEN!;
        const bot = new Bot(token);
        return bot;
      },
    },
  ],
  exports: [BOT_INSTANCE],
})
export class BotModule {}
