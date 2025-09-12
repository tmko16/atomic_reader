import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UserModule } from 'src/user/user.module';
import { ContentModule } from 'src/content/content.module';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [UserModule, ContentModule, BotModule],
  providers: [TasksService],
})
export class TasksModule {}
