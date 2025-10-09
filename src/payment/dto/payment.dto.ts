import { IsString, IsNumber, Min } from 'class-validator';

export class PaymentDto {
  @IsString()
  toAccount: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
