import { IsNotEmpty, IsEmail, IsString, Length } from "class-validator";

export class VerifyPinDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    @Length(4, 6)
    pin: string;

}