import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { ContentService } from 'src/content/content.service';
import { FileFlavor, hydrateFiles } from '@grammyjs/files';
import { UserService } from 'src/user/user.service';
import fs from 'fs-extra';
type MyContext = FileFlavor<Context>;

@Injectable()
export class BotService implements OnModuleInit {
  public bot: Bot<MyContext>;

  constructor(
    private userService: UserService,
    private contentService: ContentService,
  ) {}

  onModuleInit() {
    const bot = new Bot<MyContext>(process.env.TG_TOKEN!);
    bot.api.config.use(hydrateFiles(bot.token));

    this.bot = bot;
    this.bot.command('start', async (ctx) => {
      const tg = ctx.from!;
      let user = await this.userService.findByTelegramId(tg.id);
      if (!user) {
        user = await this.userService.create({
          telegramId: tg.id,
          telegramUsername: tg.username,
        });
        await ctx.reply('Привет! Пришли .txt файл.');
      } else {
        await ctx.reply(`С возвращением, ${user.telegramUserName || ''}!`);
      }
    });

    this.bot.on('message:document', async (ctx) => {
      const doc = ctx.message.document;
      if (!doc.mime_type?.includes('text'))
        return ctx.reply('Только текстовый файл.');

      const file = await ctx.getFile();
      const localPath = `./uploads/${file.file_id}.txt`;
      await fs.ensureDir('./uploads');
      // await downloadFile(file.file_path, localPath);
      await file.download(localPath);
      const content = await fs.readFile(localPath, 'utf-8');

      let user = await this.userService.findByTelegramId(ctx.from.id);
      if (!user) {
        user = await this.userService.create({
          telegramId: ctx.from.id,
          telegramUsername: ctx.from.username,
        });
      }
      await this.contentService.saveForUser(user, content);
      await ctx.reply('Укажи время ежедневной отправки (например 14:30).');
    });

    this.bot.hears(/^([0-1]\d|2[0-3]):([0-5]\d)$/, async (ctx) => {
      const [, h, m] = ctx.match;
      const sendAt = `${h}:${m}`;
      await this.userService.setSendAt(ctx.from?.id as number, sendAt);
      await ctx.reply(`Готово! Каждый день в ${sendAt} — новый кусочек.`);
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
