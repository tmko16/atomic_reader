import { Test, TestingModule } from '@nestjs/testing';
import { TgBot } from './tg_bot';

describe('TgBot', () => {
  let provider: TgBot;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TgBot],
    }).compile();

    provider = module.get<TgBot>(TgBot);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
