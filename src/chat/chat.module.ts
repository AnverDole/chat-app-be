import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthSharedModule } from "src/auth-shared.module";
import { AuthService } from "src/auth/auth.service";
import { ChatMessage } from "src/entities/chat-message.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";

@Module({
    imports: [AuthSharedModule, TypeOrmModule.forFeature([ChatMessage])],
    providers: [ChatGateway, AuthService, ChatService],
    controllers: [ChatController],
})
export class ChatModule {}
