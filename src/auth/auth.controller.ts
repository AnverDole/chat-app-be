import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Put,
    Req,
    UnauthorizedException,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { User } from "../entities/user.entity";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtRevocationGuard } from "./guards/jwt-revocation.guard";

@Controller("api/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Put("sign-up")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    async signUp(
        @Body() body: SignUpDto,
    ): Promise<Partial<User> | { access_token: string }> {
        if (body.password !== body.confirm_password) {
            throw new BadRequestException("Passwords do not match");
        }

        return this.authService.signUp(body);
    }

    @Post("sign-in")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    async signIn(
        @Body() body: SignInDto,
    ): Promise<Partial<User> | { access_token: string }> {
        return this.authService.signIn(body);
    }

    @Post("sign-out")
    @UseGuards(JwtRevocationGuard)
    async signOut(@Req() req: Request): Promise<{ message: string }> {
        const authHeader = req.headers["authorization"] as string;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException(
                "Missing or invalid Authorization header",
            );
        }

        const token = authHeader.split(" ")[1];
        await this.authService.revokeToken(token);

        return { message: "Successfully signed out" };
    }
}
