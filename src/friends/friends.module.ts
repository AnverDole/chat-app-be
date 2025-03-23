import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FriendsController } from "./friends.controller";
import { FriendsService } from "./friends.service";
import { User } from "src/entities/user.entity";
import { AuthSharedModule } from "src/auth-shared.module";
import { FriendRequest } from "src/entities/friend-request.entity";

@Module({
    imports: [
        AuthSharedModule,
        TypeOrmModule.forFeature([User, FriendRequest]),
    ],
    controllers: [FriendsController],
    providers: [FriendsService],
})
export class FriendsModule { }
