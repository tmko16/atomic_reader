import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';

@Injectable()
export class TgBot implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const token = this.configService.get('TG_TOKEN') as string;
    if (!token) throw new Error('No token');
    this.bot = new Bot(token);
    await this.onStart();
  }

  async onModuleDestroy() {
    await this.bot.stop();
  }

  async onStart() {
    this.bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'));
    await this.bot.start();
  }
}
