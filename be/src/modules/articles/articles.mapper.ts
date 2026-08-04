import {UsersMapper} from "../users/users.mapper";
import {ArticleResponseDto} from "./article.dto";
import {Article} from "./articles.entity";
import {TagResponseDto} from "./tags/tags.dto";
import {Tag} from "./tags/tags.entity";

export class ArticlesMapper {
    static toResponse(article: Article, hasLiked = false): ArticleResponseDto {
        return {
            id: article.id,
            title: article.title,
            description: article.description,
            image: article.image,
            content: article.content,
            tags: (article.tags ?? []).map((tag) => this.toTagResponse(tag)),
            readTime: article.readTime ?? null,
            likesCount: article.likesCount,
            author: UsersMapper.toResponse(article.author),
            isDraft: article.isDraft,
            hasLiked,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
        };
    }

    private static toTagResponse(tag: Tag): TagResponseDto {
        return {
            id: tag.id,
            name: tag.name,
        };
    }
}
