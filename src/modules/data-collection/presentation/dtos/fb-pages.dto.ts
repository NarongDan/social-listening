import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsInt, Min, IsObject, IsNotEmpty, IsBoolean } from 'class-validator';

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

const toUndefIfEmpty = ({ value }: { value: any }) =>
    value === '' || value === null ? undefined : value

export class FbCommentsItemDto {
    @IsNotEmpty()
    @IsString()
    url!: string;

    // "true" | "false" | true | false | "" -> boolean | undefined
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) =>
        value === '' || value === undefined ? undefined :
            value === true || value === 'true' ? true :
                value === false || value === 'false' ? false : value
    )
    get_all_replies?: boolean;


    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({ value }) =>
        value === '' || value === undefined ? undefined : parseInt(value, 10)
    )
    limit_records?: number;

    // "", "newest", "oldest", "relevant" … (ขึ้นกับ template) -> string | undefined
    @IsOptional()
    @IsString()
    @Transform(toUndefIfEmpty)
    comments_sort?: string;
}

export class FbCommentsPayloadDto {
    @IsArray()
    @Type(() => FbCommentsItemDto)
    input!: FbCommentsItemDto[];

    @IsOptional()
    @IsString()
    batchKey?: string;
}
