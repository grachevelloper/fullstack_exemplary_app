import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
} from "@nestjs/common";
import {Type} from "class-transformer";
import {IsInt, IsNotEmpty, IsString} from "class-validator";
import {Public} from "src/shared/decorators/auth.decorator";
import {CurrentUser} from "src/shared/decorators/current-user.decorator";
import {AuthenticatedUser} from "src/types";

import {ChecklistService} from "./checklists.service";

class AddItemDto {
    @IsString()
    @IsNotEmpty()
    text!: string;
}

class UpdateItemTextDto {
    @IsString()
    @IsNotEmpty()
    text!: string;
}

class UpdateProgressDto {
    @Type(() => Number)
    @IsInt()
    delta!: number;
}

@Controller("todos/:todoId/checklist")
export class ChecklistController {
    constructor(private readonly checklistService: ChecklistService) {}

    @Post()
    createChecklist(
        @Param("todoId", ParseUUIDPipe) todoId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.checklistService.create({
            todoId,
            initialText: [],
            actor: user,
        });
    }

    @Get()
    @Public()
    getChecklist(
        @Param("todoId", ParseUUIDPipe) todoId: string,
    ) {
        return this.checklistService.getByTodoId({todoId});
    }

    @Post("items")
    addItem(
        @Param("todoId", ParseUUIDPipe) todoId: string,
        @Body() dto: AddItemDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.checklistService.addItem({
            todoId,
            text: dto.text,
            actor: user,
        });
    }

    @Patch("items/:index")
    updateItemText(
        @Param("todoId", ParseUUIDPipe) todoId: string,
        @Param("index", ParseIntPipe) index: number,
        @Body() dto: UpdateItemTextDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.checklistService.updateItemText({
            todoId,
            itemIndex: index,
            text: dto.text,
            actor: user,
        });
    }

    @Patch("progress")
    updateProgress(
        @Param("todoId", ParseUUIDPipe) todoId: string,
        @Body() dto: UpdateProgressDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.checklistService.updateProgress({
            todoId,
            delta: dto.delta,
            actor: user,
        });
    }

    @Delete("items/:index")
    removeItem(
        @Param("todoId", ParseUUIDPipe) todoId: string,
        @Param("index", ParseIntPipe) index: number,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.checklistService.removeItem({
            todoId,
            itemIndex: index,
            actor: user,
        });
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteChecklist(
        @Param("todoId", ParseUUIDPipe) todoId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        await this.checklistService.deleteChecklist({todoId, actor: user});
    }
}
