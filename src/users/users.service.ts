import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Проверяем, существует ли пользователь с таким telegram_id
    const existingUser = await this.usersRepository.findOne({
      where: { telegram_id: createUserDto.telegram_id }
    });

    if (existingUser) {
      // Если пользователь существует, обновляем его username
      existingUser.telegram_username = createUserDto.telegram_username;
      return await this.usersRepository.save(existingUser);
    }

    // Создаем нового пользователя
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { telegram_id: telegramId } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
