import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SignUpDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private dbManager: EntityManager;

  constructor(private readonly datasource: DataSource) {
    this.dbManager = datasource.manager;
  }
  async register(authUser: SignUpDto): Promise<User> {
    const { passwordHash, ...userDetails } = authUser;

    const existingUser = await this.dbManager.findOne(User, {
      where: { email: authUser.email },
    });

    if (existingUser) {
      throw new Error('User already exists!!!');
    }

    const hashPassword = await bcrypt.hash(passwordHash, 10);

    const newUser = this.dbManager.create(User, {
      ...userDetails,
      passwordHash: hashPassword,
    });

    return await this.dbManager.save(newUser);
  }
}
