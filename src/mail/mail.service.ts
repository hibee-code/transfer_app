import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: this.configService.get('SMTP_PORT', 1025),
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    resetType: string = "password", // Default to password reset
  ): Promise<void> {
    const capitalizedType = resetType.charAt(0).toUpperCase() + resetType.slice(1);
    const resetLink = `${this.configService.get('APP_URL', 'http://localhost:3000')}/reset-${resetType}?token=${token}`;
  
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM', 'noreply@example.com'),
      to: email,
      subject: `Reset Your ${capitalizedType}`,
      html: `
        <h1>${capitalizedType} Reset Request</h1>
        <p>You requested to reset your ${capitalizedType.toLowerCase()}. Click the link below to proceed:</p>
        <p><a href="${resetLink}">Reset ${capitalizedType}</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }
  

  async sendPinEmail(email: string, pin: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM', 'noreply@example.com'),
      to: email,
      subject: 'Your Sign-in PIN',
      html: `
          <h1>Your Sign-in PIN</h1>
          <p>Your PIN for signing in is: <strong>${pin}</strong></p>
          <p>This PIN will expire in 5 minutes.</p>
          <p>If you didn't request this PIN, please ignore this email.</p>
        `,
    });
  }
}
