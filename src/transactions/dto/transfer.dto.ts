import { IsUUID, IsNumber, Min } from 'class-validator';

export class TransferDto {
  @IsUUID()
  toUserId: string;

  @IsNumber()
  @Min(1)
  amount: number;
}
