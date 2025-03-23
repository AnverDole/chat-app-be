import {
    BadRequestException,
    Injectable,
    RequestTimeoutException,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User } from "../entities/user.entity";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { TokenRepository } from "./token.repository";
import { randomUUID } from "crypto";

interface TokenPayload {
    sub: string;
    email: string;
    jti: string;
    iat: number;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly tokenRepository: TokenRepository,
    ) { }

    async signUp(
        data: SignUpDto,
    ): Promise<{ access_token: string } & Partial<User>> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirm_password, ...userData } = data;

        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email },
        });
        if (existingUser) {
            throw new BadRequestException({
                errors: { email: "This email address is already taken." },
            });
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        const user = await this.userRepository.save(
            this.userRepository.create(userData),
        );

        const token = await this.generateToken(user);
        const safeUser = this.removeSensitiveFields(user);

        return { ...safeUser, access_token: token };
    }

    async signIn(
        data: SignInDto,
    ): Promise<{ access_token: string } & Partial<User>> {
        const { email, password } = data;

        const user = await this.userRepository.findOne({ where: { email } });

        const isValid = user && (await bcrypt.compare(password, user.password));
        if (!isValid) {
            throw new UnauthorizedException(
                "Your login details are incorrect. Please try again.",
            );
        }

        const token = await this.generateToken(user);
        const safeUser = this.removeSensitiveFields(user);

        return { ...safeUser, access_token: token };
    }

    async revokeToken(token: string): Promise<void> {
        await this.tokenRepository.revokeToken(token);
    }

    private removeSensitiveFields(user: User): Partial<User> {
        // remove sensitive fields like password
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...safeUser } = user;
        return safeUser;
    }

    private async generateToken(user: User): Promise<string> {
        let attempts = 0;

        while (attempts < 10) {
            attempts++;

            // Create a fresh payload *inside* the loop to ensure unique jti every time
            const payload: TokenPayload = {
                sub: user.id,
                email: user.email,
                jti: randomUUID(), // Ensure uniqueness
                iat: Math.floor(Date.now() / 1000),
            };

            try {
                const token = await this.jwtService.signAsync(payload);

                const exists = await this.tokenRepository.isExists(token);
                if (!exists) {
                    await this.tokenRepository.saveToken(token);
                    return token; // Return on success
                }
            } catch (err: any) {
                console.log(err);
            }
        }

        throw new RequestTimeoutException(
            "Failed to generate a unique token after 10 attempts",
        );
    }

    async getAuthUser(token: string): Promise<User | null> {
        const payload: TokenPayload = this.jwtService.verify(token);

        const isRevoked = await this.tokenRepository.isTokenRevoked(token);
        if (isRevoked) return null;

        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
        });
        return user;
    }
}
