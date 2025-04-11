import { Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { SignUpDto } from './dto/register.dto';
import { Body } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { HttpCode } from '@nestjs/common';
import { RequestPinDto } from './dto/request-pin.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() signUpDto: SignUpDto) {
    return await this.authService.register(signUpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('request')
  async requestPin(@Body() dto: RequestPinDto) {
    return await this.authService.requestPin(dto);
  }

  @Post('verify') 
  async verifyPin(@Body() verifyPinDto: VerifyPinDto) {
      return await this.authService.verifyPin(verifyPinDto);
  }
}
