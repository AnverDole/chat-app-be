import { IsEmail, IsString, MinLength } from "class-validator";
import { Unique } from "typeorm";

export class SignUpDto {
    @IsEmail({}, { message: "Please enter a valid email address." })
    @Unique("email", [])
    email: string;

    @IsString({ message: "Password is required." })
    @MinLength(6, { message: "Password must be at least 6 characters." })
    password: string;

    @IsString({ message: "Please confirm your password." })
    @MinLength(1, { message: "The confirm password field is required." })
    confirm_password: string;

    @IsString({ message: "First name is required." })
    @MinLength(1, { message: "The first name field is required." })
    first_name: string;

    @IsString({ message: "Last name is required." })
    @MinLength(1, { message: "The last name field is required." })
    last_name: string;
}
