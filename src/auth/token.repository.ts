// src/auth/token.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Token } from "../entities/token.entity";

@Injectable()
export class TokenRepository {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>,
    ) { }

    async saveToken(token: string): Promise<Token> {
        const record = this.tokenRepo.create({ token });
        return this.tokenRepo.save(record);
    }

    async revokeToken(token: string): Promise<void> {
        await this.tokenRepo.update({ token }, { revoked: true });
    }

    async isExists(token: string): Promise<boolean> {
        const recordsCount = await this.tokenRepo.count({ where: { token } });
        return recordsCount > 0;
    }
    async isTokenRevoked(token: string): Promise<boolean> {
        const record = await this.tokenRepo.findOne({ where: { token } });

        if (!record) return true; // Treat unknown tokens as revoked

        const isExpired =
            new Date().getTime() - new Date(record.createdAt).getTime() >
            24 * 60 * 60 * 1000; // 1 day in ms

        return record.revoked || isExpired;
    }
}
