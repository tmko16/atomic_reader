import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TgBotModule } from './tg_bot/tg_bot.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, TgBotModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
