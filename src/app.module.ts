import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Token } from "./entities/token.entity";
import { FriendsModule } from "./friends/friends.module";
import { FriendRequest } from "./entities/friend-request.entity";
import { ChatModule } from "./chat/chat.module";
import { ChatMessage } from "./entities/chat-message.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: "mysql",
                host: config.get<string>("DB_HOST"),
                port: config.get<number>("DB_PORT"),
                username: config.get<string>("DB_USERNAME"),
                password: config.get<string>("DB_PASSWORD"),
                database: config.get<string>("DB_NAME"),
                entities: [User, Token, FriendRequest, ChatMessage],
                synchronize: false, // <-- important: don't enable this. synchronizations are handled by migrations
            }),
        }),

        TypeOrmModule.forFeature([User]),
        AuthModule,
        FriendsModule,
        ChatModule,
    ],
})
export class AppModule {}
