import { Module } from '@nestjs/common';
import { TgBot } from './tg_bot';
import { UsersModule } from '../users/users.module';

@Module({ 
  imports: [UsersModule],
  providers: [TgBot] 
})
export class TgBotModule {}
