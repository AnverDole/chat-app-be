import { Type } from "class-transformer";
import { IsNumber, IsOptional, MinLength } from "class-validator";

export class GetChatDto {
    @MinLength(1, { message: "The receiver_id field is required." })
    receiver_id: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "The per_page field must be a number." })
    per_page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "The page field must be a number." })
    page?: number;
}
