import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SignUpDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private dbManager: EntityManager;

  constructor(private readonly datasource: DataSource) {
    this.dbManager = datasource.manager;

    // Ensure environment variables are properly loaded
    this.jwtSecret = process.env.SECRET || 'default_secret_key';
    this.refreshSecret = process.env.REFRESHSECRET || 'default_refresh_secret';

    // if (!process.env.SECRET || !process.env.REFRESHSECRET) {
    //   console.warn(
    //     '⚠️ Warning: SECRET or REFRESHSECRET is not set. Using default values. Set them in your .env file!',
    //   );
    // }
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

  async login(
    authUser: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, passwordHash } = authUser;

    const user = await this.dbManager.findOne(User, { where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPassword = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isPassword) {
      throw new Error('Invalid password');
    }

    // Generate JWT tokens
    const payload = { userId: user.id, email: user.email };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
