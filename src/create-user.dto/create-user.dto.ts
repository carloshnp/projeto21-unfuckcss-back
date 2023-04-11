import { IsString, MinLength, MaxLength, IsEmail } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}
