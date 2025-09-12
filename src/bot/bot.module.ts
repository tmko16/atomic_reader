import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from 'src/user/user.module';
import { ContentModule } from 'src/content/content.module';
import { BOT_INSTANCE } from './bot.constans';

@Module({
  imports: [UserModule, ContentModule],
  providers: [
    BotService,
    {
      provide: BOT_INSTANCE,
      useFactory: (bs: BotService) => bs.bot,
      inject: [BotService],
    },
  ],
  exports: [BOT_INSTANCE],
})
export class BotModule {}
