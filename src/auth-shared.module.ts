import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Token } from "./entities/token.entity";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { TokenRepository } from "./auth/token.repository";
import { AuthService } from "./auth/auth.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Token]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || "supersecretjwt", // use env var!
            signOptions: { expiresIn: "1d" },
        }),
    ],
    controllers: [],
    providers: [AuthService, TokenRepository, JwtService],
    exports: [TypeOrmModule, JwtModule, AuthService, TokenRepository],
})
export class AuthSharedModule { }
