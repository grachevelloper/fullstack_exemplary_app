import {UsersMapper} from "../users/users.mapper";
import {CommentResponseDto} from "./comments.dto";
import {Comment} from "./comments.entity";

type CommentWithLikedState = Comment & {
    hasLiked?: boolean;
};

export class CommentsMapper {
    static toResponse(
        comment: CommentWithLikedState,
        hasLiked = Boolean(comment.hasLiked),
    ): CommentResponseDto {
        return {
            id: comment.id,
            content: comment.content,
            entityType: comment.entityType,
            entityId: comment.entityId,
            parentId: comment.parentId,
            depth: comment.depth,
            likesCount: comment.likesCount,
            hasLiked,
            author: UsersMapper.toResponse(comment.author),
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };
    }
}
