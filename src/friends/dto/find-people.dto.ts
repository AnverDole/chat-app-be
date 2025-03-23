import { Type } from "class-transformer";
import { IsNumber, IsOptional, MinLength } from "class-validator";

export class FindPeopleDto {
    @MinLength(1, { message: "The search term field is required." })
    search_term: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "The per_page field must be a number." })
    per_page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "The page field must be a number." })
    page?: number;
}
