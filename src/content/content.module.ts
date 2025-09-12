import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Content])],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
