import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { User } from './user/entities/user.entity';
import { Content } from './content/entities/content.entities';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { ContentModule } from './content/content.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(config.get<string>('DATABASE_PORT', '5432'), 10),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [User, Content],
        synchronize:
          config.get<string>('DATABASE_SYNCHRONIZE', 'true') === 'true',
        logging: config.get<string>('DATABASE_LOGGING', 'true') === 'true',
      }),
    }),
    ScheduleModule.forRoot(),
    UserModule,
    ContentModule,
    BotModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
