import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, Context, Keyboard } from 'grammy';
import { ContentService } from 'src/content/content.service';
import { FileFlavor, hydrateFiles } from '@grammyjs/files';
import { UserService } from 'src/user/user.service';
import fs from 'fs-extra';
import { BOT_INSTANCE } from './bot.constans';
type MyContext = FileFlavor<Context>;

@Injectable()
export class BotService implements OnModuleInit {
  public bot: Bot<MyContext>;

  constructor(
    private userService: UserService,
    private contentService: ContentService,
    @Inject(BOT_INSTANCE) bot: Bot,
  ) {
    this.bot = bot as Bot<MyContext>;
  }

  // Создаем постоянную клавиатуру
  private getMainKeyboard() {
    return new Keyboard()
      .text('📖 Получить кусочек')
      .text('📁 Загрузить файл')
      .row()
      .text('⏰ Настроить время')
      .text('ℹ️ Помощь')
      .resized()
      .persistent();
  }

  onModuleInit() {
    this.bot.api.config.use(hydrateFiles(this.bot.token));


    this.bot.command('start', async (ctx) => {
      const tg = ctx.from!;
      let user = await this.userService.findByTelegramId(tg.id);
      if (!user) {
        user = await this.userService.create({
          telegramId: tg.id,
          telegramUsername: tg.username,
        });
        await ctx.reply(
          'Привет! Добро пожаловать в Atomic Reader! 📚\n\n' +
            'Этот бот поможет вам читать книги по частям каждый день.\n\n' +
            'Используйте кнопки внизу экрана для навигации:',
          { reply_markup: this.getMainKeyboard() },
        );
      } else {
        await ctx.reply(
          `С возвращением, ${user.telegramUserName || 'друг'}! 👋\n\n` +
            'Что хотите сделать?',
          { reply_markup: this.getMainKeyboard() },
        );
      }
    });

    // Обработчики для Reply Keyboard кнопок
    this.bot.hears('📖 Получить кусочек', async (ctx) => {
      const user = await this.userService.findByTelegramId(
        ctx.from?.id as number,
      );
      if (!user) {
        await ctx.reply(
          '❌ Сначала загрузите файл!\n\n' +
            'Используйте кнопку "📁 Загрузить файл" для начала работы.',
        );
        return;
      }

      try {
        const chunk = await this.contentService.getNextChunk(user);
        if (!chunk) {
          await ctx.reply(
            '✅ Файл закончился!\n\nЗагрузите новый файл для продолжения чтения!',
          );
          return;
        }

        await ctx.reply(chunk);
      } catch (error) {
        console.error('Error getting next chunk:', error);
        await ctx.reply(
          '❌ Произошла ошибка при получении текста. Попробуйте еще раз.',
        );
      }
    });

    this.bot.hears('📁 Загрузить файл', async (ctx) => {
      await ctx.reply(
        '📁 Загрузите .txt файл для чтения\n\n' +
          '⚠️ **Внимание:** Если у вас уже есть загруженный файл, он будет заменен новым.\n\n' +
          'Просто отправьте файл в этот чат, и я начну отправлять вам его по частям!',
      );
    });

    this.bot.hears('⏰ Настроить время', async (ctx) => {
      await ctx.reply(
        '⏰ Настройка времени отправки\n\n' +
          'Отправьте время в формате ЧЧ:ММ (например: 14:30)\n' +
          'Я буду отправлять вам новые кусочки каждый день в указанное время.',
      );
    });

    this.bot.hears('ℹ️ Помощь', async (ctx) => {
      await ctx.reply(
        'ℹ️ Справка по использованию бота:\n\n' +
          '📖 **Получить кусочек** - получить следующую часть текста\n' +
          '📁 **Загрузить файл** - загрузить новый .txt файл\n' +
          '⏰ **Настроить время** - установить время ежедневной отправки\n\n' +
          'Команды:\n' +
          '/start - начать работу с ботом\n' +
          '/more - получить следующий кусочек (альтернатива кнопке)\n\n' +
          'Просто используйте кнопки внизу экрана для навигации!',
      );
    });

    this.bot.on('message:document', async (ctx) => {
      const doc = ctx.message.document;
      if (!doc.mime_type?.includes('text'))
        return ctx.reply('❌ Только текстовый файл.');

      const file = await ctx.getFile();
      const localPath = `./uploads/${file.file_id}.txt`;
      await fs.ensureDir('./uploads');
      await file.download(localPath);
      const content = await fs.readFile(localPath, 'utf-8');

      let user = await this.userService.findByTelegramId(ctx.from.id);
      if (!user) {
        user = await this.userService.create({
          telegramId: ctx.from.id,
          telegramUsername: ctx.from.username,
        });
      }

      // Проверяем, есть ли у пользователя уже загруженный файл
      const hadPreviousFile = !!user.content;

      await this.contentService.saveForUser(user, content);

      if (hadPreviousFile) {
        await ctx.reply(
          '✅ Файл успешно заменен!\n\n' +
            'Старый файл удален, новый файл готов к чтению.\n' +
            'Чтение начнется с самого начала.\n\n' +
            'Теперь укажите время ежедневной отправки (например: 14:30) или начните чтение прямо сейчас!',
        );
      } else {
        await ctx.reply(
          '✅ Файл успешно загружен!\n\n' +
            'Теперь укажите время ежедневной отправки (например: 14:30) или начните чтение прямо сейчас!',
        );
      }
    });

    this.bot.hears(/^([0-1]\d|2[0-3]):([0-5]\d)$/, async (ctx) => {
      const [, h, m] = ctx.match;
      const sendAt = `${h}:${m}`;
      console.log({ sendAt });
      await this.userService.setSendAt(ctx.from?.id as number, sendAt);

      await ctx.reply(
        `✅ Готово! Каждый день в ${sendAt} — новый кусочек.\n\n` +
          'Хотите начать чтение прямо сейчас?',
      );
    });

    this.bot.command('more', async (ctx) => {
      const user = await this.userService.findByTelegramId(
        ctx.from?.id as number,
      );
      if (!user) return;
      const chunk = await this.contentService.getNextChunk(user);
      if (!chunk) return ctx.reply('Файл закончился ✅');
      await ctx.reply(chunk);
    });

    this.bot.catch((err) => console.error(err));
    this.bot
      .start()
      .then(() => console.log('bot started'))
      .catch(() => console.log('bot not started'));
  }
}
