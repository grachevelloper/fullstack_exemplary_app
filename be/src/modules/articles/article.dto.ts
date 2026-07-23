import {Type} from "class-transformer";
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from "class-validator";

import {PaginatedResponseDto} from "../../shared/dto/paginated-response.dto";
import {Order, SortBy} from "../../types";
import {UserResponseDto} from "../users/dto/user-response.dto";
import {TagResponseDto} from "./tags/tags.dto";

export class TagDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => TagDto)
    @IsOptional()
    tags?: TagDto[];

    @IsNumber()
    @Min(1)
    @IsOptional()
    readTime?: number;
}

export class UpdateArticleDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @IsUrl()
    @IsOptional()
    image?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    content?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    readTime?: number;

    @IsArray()
    @ValidateNested({each: true})
    @Type(() => TagDto)
    @IsOptional()
    tags?: TagDto[];
}

export class ArticleResponseDto {
    id!: string;
    title!: string;
    image!: string;
    content!: string;
    tags!: TagResponseDto[];
    readTime!: number | null;
    likesCount!: number;
    author!: UserResponseDto;
    isDraft!: boolean;
    hasLiked!: boolean;
    createdAt!: string;
    updatedAt!: string;
}

export type ResponseArticle = ArticleResponseDto;

export class ResponseGetArticles extends PaginatedResponseDto<ArticleResponseDto> {}

export class RequestGetArticles {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsUUID()
    authorId?: string;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minLikes?: number = 0;

    @IsOptional()
    @IsDateString()
    createdAfter?: string;

    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.CREATED_AT;

    @IsOptional()
    @IsEnum(Order)
    order?: Order = Order.DESC;
}
