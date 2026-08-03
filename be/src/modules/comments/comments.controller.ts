import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseEnumPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from "@nestjs/common";

import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {AuthenticatedUser, Order} from "../../types";
import {
    COMMENT_TARGET_TYPES,
    CommentResponseDto,
    CreateCommentDto,
    QueryCommentsDto,
    ResponseGetComments,
    UpdateCommentDto,
} from "./comments.dto";
import {EntityCommentType} from "./comments.entity";
import {CommentsMapper} from "./comments.mapper";
import {CommentsService} from "./comments.service";

@Controller("comments")
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() createCommentData: CreateCommentDto,
    ): Promise<CommentResponseDto> {
        return CommentsMapper.toResponse(
            await this.commentsService.create(user, createCommentData),
        );
    }

    @HttpCode(HttpStatus.OK)
    @Get(":id")
    async getByid(
        @CurrentUser() user: AuthenticatedUser,
        @Param("id", ParseUUIDPipe) id: string,
    ): Promise<CommentResponseDto> {
        return CommentsMapper.toResponse(
            await this.commentsService.findOneForActor(id, user),
        );
    }

    @HttpCode(HttpStatus.OK)
    @Get(":entityType/:entityId")
    async getByEntityId(
        @Param("entityType", new ParseEnumPipe(COMMENT_TARGET_TYPES))
        entityType: EntityCommentType,
        @Param("entityId", ParseUUIDPipe) entityId: string,
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryCommentsDto,
    ): Promise<ResponseGetComments> {
        const commentsPage = await this.commentsService.findByEntity({
            actor: user,
            entityType,
            entityId,
            limit: query.limit,
            order: query.order as Order | undefined,
            page: query.page,
        });

        return {
            ...commentsPage,
            items: commentsPage.items.map((comment) =>
                CommentsMapper.toResponse(comment, comment.hasLiked),
            ),
        };
    }

    @HttpCode(HttpStatus.OK)
    @Patch(":id")
    async update(
        @CurrentUser() user: AuthenticatedUser,
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateCommentData: UpdateCommentDto,
    ): Promise<CommentResponseDto> {
        return CommentsMapper.toResponse(
            await this.commentsService.update({
                actor: user,
                id,
                data: updateCommentData,
            }),
        );
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":id")
    async delete(
        @CurrentUser() user: AuthenticatedUser,
        @Param("id", ParseUUIDPipe) id: string,
    ): Promise<void> {
        await this.commentsService.delete({id, actor: user});
    }
}
