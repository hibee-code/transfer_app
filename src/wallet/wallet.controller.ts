import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FundWalletDto } from './dto/fund-wallet.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Post('fund')
  async fundWallet(@Request() req, @Body() dto: FundWalletDto) {
    return this.walletService.fundWallet(req.user.userId, dto.amount);
  }
}
