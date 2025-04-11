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
import { VerifyPinDto } from './dto/verify-pin.dto';
import { RequestPinDto } from './dto/request-pin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
  const { email, newPassword, passwordResetToken } = resetPasswordDto;
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
  const isTokenValid = await bcrypt.compare(passwordResetToken, user.passwordResetToken);
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
private async generatePin(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
  }
async requestPin(Request: RequestPinDto): Promise<string> {
  const { email } = Request;
    const user = await this.dbManager.findOne(User, { where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // generate pin and store it in the database

    const pin = await this.generatePin();
    const hashedPin = await bcrypt.hash(pin, 10);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    user.hashedPin = hashedPin;
    user.pinExpiresAt = expiresAt;

    await this.dbManager.save(user);

    // Send PIN reset email using MailService
    await this.mailService.sendPinEmail(email, pin);

    return 'Transaction PIN reset link sent to email';
  }

  async verifyPin(verify: VerifyPinDto): Promise<string> {
    const {email, pin} = verify;
    const user = await this.dbManager.findOne(User, { where: { email } });
    if (!user || !user.hashedPin || !user.pinExpiresAt) {
      throw new BadRequestException('Invalid or expired PIN');
    }

    // Check if the PIN has expired
    if (user.pinExpiresAt < new Date()) {
      throw new BadRequestException('PIN has expired');
    }

    // Verify the PIN
    const isPinValid = await bcrypt.compare(pin, user.hashedPin);
    if (!isPinValid) {
      throw new BadRequestException('Invalid PIN');
    }

    // Clear the PIN and expiry date
    await this.dbManager.update(User, { email }, {
      hashedPin: undefined,
      pinExpiresAt: undefined,
    });

    return 'PIN has been verified successfully';
  }
}
