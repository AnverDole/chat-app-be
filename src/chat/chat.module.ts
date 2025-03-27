import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthSharedModule } from "src/auth-shared.module";
import { AuthService } from "src/auth/auth.service";
import { ChatMessage } from "src/entities/chat-message.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { User } from "src/entities/user.entity";
import { FriendsService } from "src/friends/friends.service";
import { FriendRequest } from "src/entities/friend-request.entity";

@Module({
    imports: [AuthSharedModule, TypeOrmModule.forFeature([ChatMessage, User, FriendRequest])],
    providers: [ChatGateway, AuthService, ChatService, FriendsService],
    controllers: [ChatController],
})
export class ChatModule { }
