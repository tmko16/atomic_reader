import { Module } from '@nestjs/common';
import { TgBot } from './tg_bot';

@Module({ providers: [TgBot] })
export class TgBotModule {}
