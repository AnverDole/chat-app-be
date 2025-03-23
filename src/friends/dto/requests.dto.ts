import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class RequestsDto {
    @IsOptional()
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
