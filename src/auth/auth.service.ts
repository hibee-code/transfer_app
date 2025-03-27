import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SignUpDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private dbManager: EntityManager;

  constructor(
    private readonly configService: ConfigService,
    private readonly datasource: DataSource,
    private readonly mailService: MailService,
  ) {
    this.dbManager = datasource.manager;
    this.jwtSecret = this.configService.get<string>(
      'auth.jwtSecret',
      'defaultJwtSecret',
    );
    this.refreshSecret = this.configService.get<string>(
      'auth.jwtRefreshSecret',
      'defaultRefreshSecret',
    );
    this.accessTokenExpiry = this.configService.get<string>(
      'auth.accessTokenExpiresIn',
      '15m',
    );
    this.refreshTokenExpiry = this.configService.get<string>(
      'auth.refreshTokenExpiresIn',
      '7d',
    );
  }

  async register(authUser: SignUpDto): Promise<User> {
    const { passwordHash, ...userDetails } = authUser;
    const bankAccountNumber = this.generateBankAccountNumber();

    const existingUser = await this.dbManager.findOne(User, {
      where: { email: authUser.email },
    });

    if (existingUser) {
      throw new Error('User already exists!!!');
    }

    const hashPassword = await bcrypt.hash(passwordHash, 12); // Stronger hashing

    const newUser = this.dbManager.create(User, {
      ...userDetails,
      passwordHash: hashPassword,
      bankAccountNumber,
    });

    return await this.dbManager.save(newUser);
  }

  async login(
    authUser: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, passwordHash } = authUser;

    const user = await this.dbManager.findOne(User, { where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      passwordHash,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate JWT tokens with dynamic expiration
    const payload = { userId: user.id, email: user.email };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }

  private generateBankAccountNumber(): string {
    return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }

  async forgotPassword( forgotPasswordDto: ForgotPasswordDto): Promise<String> {
    const { email } = forgotPasswordDto;

    const user = await this.dbManager.findOne(User, { where: { email } });
    if(!user) {
      throw new UnauthorizedException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    await this.dbManager.save(user);


      // Send PIN reset email using MailService
  await this.mailService.sendPasswordResetEmail(email, resetToken, 'Transaction PIN');

  return 'Transaction PIN reset link sent to email';
}

async resetPassword(email: string, newPassword: string, resetToken: string): Promise<string> {
  // Find the user with the given email
  const user = await this.dbManager.findOne(User, { where: { email } });
  if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Check if the token has expired
  if (user.passwordResetExpires < new Date()) {
    throw new BadRequestException('Reset token has expired');
  }

  // Verify the reset token
  const isTokenValid = await bcrypt.compare(resetToken, user.passwordResetToken);
  if (!isTokenValid) {
    throw new BadRequestException('Invalid reset token');
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user's password and clear reset token
  await this.dbManager.update(User, { email }, {
    passwordHash: hashedPassword,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  });

  return 'Password has been reset successfully';
}

}
