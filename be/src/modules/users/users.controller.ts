import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";

import {Public} from "../../shared/decorators/auth.decorator";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {Roles} from "../../shared/decorators/role.decorator";
import {RolesGuard} from "../../shared/guards/roles.guard";
import {AuthenticatedUser, Role} from "../../types";
import {
    NowadaysResponseDto,
    UserResponseDto,
} from "./dto/user-response.dto";
import {ChangePasswordDto, UpdateUserDto} from "./user.dto";
import {UsersMapper} from "./users.mapper";
import {UsersService} from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get("nowadays")
    @Public()
    async getNowadays(): Promise<NowadaysResponseDto | null> {
        const admin = await this.usersService.findAdmin();
        return admin ? UsersMapper.toNowadaysResponse(admin) : null;
    }

    @Get("me")
    async getMe(
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<UserResponseDto> {
        const user = await this.usersService.findForActor(actor.id, actor);
        return UsersMapper.toResponse(user);
    }

    @Patch("me")
    async updateMe(
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<UserResponseDto> {
        const user = await this.usersService.update(
            actor.id,
            updateUserDto,
            actor,
        );
        return UsersMapper.toResponse(user);
    }

    @Patch("me/password")
    @HttpCode(HttpStatus.NO_CONTENT)
    async changeMyPassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<void> {
        await this.usersService.changePassword(
            actor.id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword,
            actor,
        );
    }

    @Get(":id")
    async findOne(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<UserResponseDto> {
        const user = await this.usersService.findForActor(id, actor);
        return UsersMapper.toResponse(user);
    }

    @Patch(":id")
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<UserResponseDto> {
        const user = await this.usersService.update(id, updateUserDto, actor);
        return UsersMapper.toResponse(user);
    }

    @Patch(":id/password")
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() changePasswordDto: ChangePasswordDto,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<void> {
        await this.usersService.changePassword(
            id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword,
            actor,
        );
    }

    @Delete(":id")
    @Roles(Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<void> {
        await this.usersService.delete(id, actor);
    }
}
