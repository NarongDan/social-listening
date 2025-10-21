import { IsNotEmpty, IsString } from "class-validator"

export class AnalyzeCommentDto {
    @IsNotEmpty()
    @IsString()
    headline: string
    @IsNotEmpty()
    @IsString()
    comment: string
}
