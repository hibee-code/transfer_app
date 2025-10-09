import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/database/db.config';
import { validate } from 'class-validator';
import appConfig from './config/app.config';
import { ConfigModule } from '@nestjs/config/dist/config.module';

import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      validate,
      cache: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
  AuthModule,
  MailModule,
  UsersModule,
  WalletModule,
  TransactionsModule,
  PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
