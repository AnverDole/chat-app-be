import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { FindPeopleDto } from "./dto/find-people.dto";
import { FriendsService } from "./friends.service";
import { JwtRevocationGuard } from "src/auth/guards/jwt-revocation.guard";
import { SendRequestDto } from "./dto/send-request.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { User } from "src/entities/user.entity";
import { CancelRequestDto } from "./dto/cancel-request.dto";
import { UnFriendDto } from "./dto/un-friend.dto";
import { RequestsDto } from "./dto/requests.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import { FriendsDto } from "./dto/friends.dto";
import { ApproveRequestDto } from "./dto/approve-request.dto";

@Controller("api/friends")
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Get("/")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    getFriends(@Query() req: FriendsDto, @CurrentUser() user: User): any {
        return this.friendsService.getFriends(req, user.id);
    }
    @Get("/find-people")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    findPeople(@Query() req: FindPeopleDto, @CurrentUser() user: User): any {
        return this.friendsService.findPeople(req, user.id);
    }

    @Post("unfriend")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    async unFriend(
        @Body() body: UnFriendDto,
        @CurrentUser() user: User,
    ): Promise<{ status: boolean }> {
        await this.friendsService.unFriend(user.id, body.user_id);

        return {
            status: true,
        };
    }

    @Get("requests")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    getAllOutgoingRequests(
        @Query() query: RequestsDto,
        @CurrentUser() user: User,
    ): any {
        return this.friendsService.getRequests(query, user.id);
    }

    @Post("requests/outgoing/send")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    async sendRequest(
        @Body() body: SendRequestDto,
        @CurrentUser() user: User,
    ): Promise<{ status: boolean }> {
        await this.friendsService.sendRequest(user.id, body.user_id);

        return {
            status: true,
        };
    }

    @Post("requests/outgoing/cancel")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    async cancelRequest(
        @Body() body: CancelRequestDto,
        @CurrentUser() user: User,
    ): Promise<{ status: boolean }> {
        await this.friendsService.cancelRequest(user.id, body.user_id);

        return {
            status: true,
        };
    }


    @Post("requests/incoming/reject")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    async rejectRequest(
        @Body() body: RejectRequestDto,
        @CurrentUser() user: User,
    ): Promise<{ status: boolean }> {
        await this.friendsService.cancelRequest(user.id, body.user_id);

        return {
            status: true,
        };
    }
    
    @Post("requests/incoming/approve")
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @UseGuards(JwtRevocationGuard)
    async approveRequest(
        @Body() body: ApproveRequestDto,
        @CurrentUser() user: User,
    ): Promise<{ status: boolean }> {
        await this.friendsService.approveRequest(body.user_id, user.id);

        return {
            status: true,
        };
    }
}
