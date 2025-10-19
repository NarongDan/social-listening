import { IsArray, IsOptional, IsString, IsInt, Min, IsObject, IsNotEmpty } from 'class-validator';

export class FbPageInputItemDto {
    @IsNotEmpty() @IsString() url!: string;
    @IsOptional() @IsInt() @Min(1) num_of_posts?: number;
    @IsOptional() posts_to_not_include?: string[];
    @IsOptional() @IsString() start_date?: string; // 'MM-DD-YYYY' หรือค่าว่าง
    @IsOptional() @IsString() end_date?: string;
}

export class FbPagesPostsPayloadDto {
    @IsArray() input!: FbPageInputItemDto[]; // โครงเดียวกับ BrightData
    @IsOptional() @IsString() batchKey?: string;
}

