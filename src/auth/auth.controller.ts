import { Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { SignUpDto } from './dto/register.dto';
import { Body } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { HttpCode } from '@nestjs/common';

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
}
