import { IsEmail, IsString, MinLength } from "class-validator";

export class SignInDto {
    @IsEmail({}, { message: "Please enter a valid email address." })
    @MinLength(1, { message: "The email field is required." })
    email: string;

    @IsString({ message: "The password field is required." })
    @MinLength(1, { message: "The password field is required." })
    password: string;
}
