import { MinLength } from "class-validator";

export class UnFriendDto {
    @MinLength(1, { message: "The user_id field is required." })
    user_id: string;
}
