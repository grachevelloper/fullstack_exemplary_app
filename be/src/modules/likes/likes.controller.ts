import {
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    ParseEnumPipe,
    ParseUUIDPipe,
    Post,
} from "@nestjs/common";

import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {AuthenticatedUser} from "../../types";
import {LIKE_TARGET_TYPES} from "./likes.dto";
import {EntityLikeType} from "./likes.entity";
import {LikesService} from "./likes.service";

@Controller("likes")
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Post(":entityType/:entityId")
    async create(
        @CurrentUser() user: AuthenticatedUser,
        @Param("entityType", new ParseEnumPipe(LIKE_TARGET_TYPES))
        entityType: EntityLikeType,
        @Param("entityId", ParseUUIDPipe) entityId: string,
    ) {
        return await this.likesService.create({actor: user, entityType, entityId});
    }

    @Delete(":entityType/:entityId")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @CurrentUser() user: AuthenticatedUser,
        @Param("entityType", new ParseEnumPipe(LIKE_TARGET_TYPES))
        entityType: EntityLikeType,
        @Param("entityId", ParseUUIDPipe) entityId: string,
    ) {
        await this.likesService.delete({actor: user, entityType, entityId});
    }
}
