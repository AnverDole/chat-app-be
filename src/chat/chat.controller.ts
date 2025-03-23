import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtRevocationGuard } from "src/auth/guards/jwt-revocation.guard";
import { FriendsDto } from "src/friends/dto/friends.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "src/entities/user.entity";
import { GetChatDto } from "./dto/get-chat";

@Controller("api/chats")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get("/")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    getFriends(@Query() req: GetChatDto, @CurrentUser() user: User): any {
        return this.chatService.getChat({
            sender_id: user.id,
            receiver_id: req.receiver_id,
            per_page: req.per_page,
            page: req.page,
        });
    }
}
