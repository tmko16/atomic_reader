import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'app_password',
      username: 'app_user',
      entities: [User, Content],
      database: 'app_db',
      synchronize: true,
      logging: true,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    ContentModule,
    BotModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
