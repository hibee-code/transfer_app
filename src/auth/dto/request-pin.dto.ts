import { IsNotEmpty, IsEmail } from "class-validator";

export class RequestPinDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}