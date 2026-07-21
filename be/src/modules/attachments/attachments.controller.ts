import {
    Controller,
    Delete,
    FileValidator,
    HttpCode,
    HttpStatus,
    MaxFileSizeValidator,
    Param,
    ParseEnumPipe,
    ParseFilePipe,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";

import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {AuthGuard} from "../../shared/guards/auth.guard";
import {AuthenticatedUser} from "../../types";
import {
    ATTACHMENT_TARGET_TYPES,
    AttachmentResponseDto,
    EntityAttachmentType,
} from "./attachments.dto";
import {AttachmentsService} from "./attachments.service";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

class ImageMimeTypeValidator extends FileValidator<Record<string, never>> {
    isValid(file?: Express.Multer.File): boolean {
        return Boolean(file && ALLOWED_IMAGE_TYPES.has(file.mimetype));
    }

    buildErrorMessage(): string {
        return "Only JPEG, PNG, and WebP images are allowed";
    }
}

@UseGuards(AuthGuard)
@Controller("attachments")
export class AttachmentsController {
    constructor(private attachmentsService: AttachmentsService) {}

    @Post(":entityType/:entityId")
    @UseInterceptors(FileInterceptor("file"))
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({maxSize: MAX_SIZE}),
                    new ImageMimeTypeValidator({}),
                ],
            }),
        )
        file: Express.Multer.File,
        @Param("entityType", new ParseEnumPipe(ATTACHMENT_TARGET_TYPES))
        entityType: EntityAttachmentType,
        @Param("entityId", ParseUUIDPipe) entityId: string,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<AttachmentResponseDto> {
        return this.attachmentsService.attachImage(
            file,
            entityType,
            entityId,
            actor,
        );
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentUser() actor: AuthenticatedUser,
    ): Promise<void> {
        await this.attachmentsService.deleteAttachmentById(id, actor);
    }
}
