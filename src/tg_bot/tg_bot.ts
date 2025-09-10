/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context } from 'grammy';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TgBot implements OnModuleInit, OnModuleDestroy {
  private bot: Bot;
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

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
    this.bot.command('start', async (ctx: Context) => {
      console.log(ctx);

      // Проверяем, что ctx.from существует
      if (!ctx.from) {
        await ctx.reply(
          'Ошибка: не удалось получить информацию о пользователе',
        );
        return;
      }

      const { id, username } = ctx.from;

      // Создаем пользователя в базе данных
      try {
        const user = new User();
        user.telegram_id = id;
        user.telegram_username = username || 'unknown';

        // Сохраняем пользователя через UsersService
        await this.usersService.create(user);

        await ctx.reply('Добро пожаловать! Вы успешно зарегистрированы.');
      } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        await ctx.reply('Произошла ошибка при регистрации. Попробуйте позже.');
      }
    });
    await this.bot.start();
  }
}
