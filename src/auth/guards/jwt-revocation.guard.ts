import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { TokenRepository } from "../token.repository";
import { Repository } from "typeorm";
import { User } from "../../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class JwtRevocationGuard implements CanActivate {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly tokenRepository: TokenRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException(
                "Authentication token is missing or improperly formatted.",
            );
        }

        const token = authHeader.split(" ")[1];

        try {
            // 1. Verify token
            const payload: { sub: string; email: string } =
                await this.jwtService.verifyAsync(token);
            const userId = payload.sub;

            // 2. Check token existence
            const exists = await this.tokenRepository.isExists(token);
            if (!exists) {
                throw new UnauthorizedException(
                    "Your session has expired. Please sign in again.",
                );
            }

            // 3. Check token revocation
            const revoked = await this.tokenRepository.isTokenRevoked(token);
            if (revoked) {
                throw new UnauthorizedException(
                    "This session has been logged out. Please sign in again.",
                );
            }

            // 4. Attach user to request
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                throw new UnauthorizedException(
                    "Authentication token is invalid.",
                );
            }

            request.user = user;
            return true;
        } catch (err: any) {
            console.log(err);
            throw new UnauthorizedException(
                "Authentication failed. Please sign in again.",
            );
        }
    }
}
