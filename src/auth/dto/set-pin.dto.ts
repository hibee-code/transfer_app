import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SetPinDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 6)
  Pin: string;
}
