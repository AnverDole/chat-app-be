// src/auth/entities/token.entity.ts
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from "typeorm";

@Entity()
export class Token {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, length: 512 })
    token: string;

    @Column({ default: false })
    revoked: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
